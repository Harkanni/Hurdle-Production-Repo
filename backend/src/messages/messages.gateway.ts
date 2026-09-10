import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId: string;
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // configure appropriately for production
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  // ─── Connection Handling ────────────────────────────────────────────────────

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT from handshake auth or query param
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'hurdle_jwt_secret_change_in_production',
      ) as any;

      // Normalize: support both sub and userId in the token payload
      client.userId = (payload.userId ?? payload.sub)?.toString();
      client.username = payload.username ?? '';

      this.logger.log(`Client connected: ${client.id} (user: ${client.username})`);
      client.emit('connected', { message: 'Successfully connected to Hurdle chat' });
    } catch (error) {
      this.logger.warn(`Unauthorized connection attempt: ${client.id}`);
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} (user: ${client.username})`);
  }

  // ─── Join a Channel Room ────────────────────────────────────────────────────

  @SubscribeMessage('join_channel')
  async handleJoinChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!data?.channelId) {
      throw new WsException('channelId is required');
    }

    const room = `channel:${data.channelId}`;
    await client.join(room);

    this.logger.log(`User ${client.username} joined room: ${room}`);

    client.emit('joined_channel', {
      channelId: data.channelId,
      message: `Joined channel ${data.channelId}`,
    });

    // Notify others in the channel
    client.to(room).emit('user_joined', {
      channelId: data.channelId,
      user: { id: client.userId, username: client.username },
    });
  }

  // ─── Leave a Channel Room ───────────────────────────────────────────────────

  @SubscribeMessage('leave_channel')
  async handleLeaveChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!data?.channelId) {
      throw new WsException('channelId is required');
    }

    const room = `channel:${data.channelId}`;
    await client.leave(room);

    this.logger.log(`User ${client.username} left room: ${room}`);

    // Notify others in the channel
    client.to(room).emit('user_left', {
      channelId: data.channelId,
      user: { id: client.userId, username: client.username },
    });

    client.emit('left_channel', { channelId: data.channelId });
  }

  // ─── Typing Indicators ──────────────────────────────────────────────────────

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const room = `channel:${data.channelId}`;
    client.to(room).emit('user_typing', {
      channelId: data.channelId,
      user: { id: client.userId, username: client.username },
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const room = `channel:${data.channelId}`;
    client.to(room).emit('user_stopped_typing', {
      channelId: data.channelId,
      user: { id: client.userId, username: client.username },
    });
  }

  // ─── Emit Helpers (called by MessagesService) ────────────────────────────────

  emitNewMessage(channelId: string, message: any) {
    this.server.to(`channel:${channelId}`).emit('new_message', message);
  }

  emitMessageDeleted(channelId: string, messageId: string) {
    this.server.to(`channel:${channelId}`).emit('message_deleted', { messageId, channelId });
  }
}
