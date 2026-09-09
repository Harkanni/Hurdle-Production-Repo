import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChannelsService } from '../channels/channels.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessagesGateway } from './messages.gateway';
import { Message, MessageDocument } from './schemas/message.schema';
import { Channel, ChannelDocument } from '../channels/schemas/channel.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    private readonly channelsService: ChannelsService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  // ─── Send Message ───────────────────────────────────────────────────────────
  async sendMessage(channelId: string, dto: SendMessageDto, userId: string) {
    if (!Types.ObjectId.isValid(channelId)) throw new NotFoundException('Channel not found');

    // Only members can send messages
    await this.channelsService.verifyMembership(channelId, userId);

    const message = await this.messageModel.create({
      content: dto.content,
      channelId: new Types.ObjectId(channelId),
      senderId: new Types.ObjectId(userId),
    });

    const formatted = this.formatMessage(message);

    // Emit real-time event to all clients in the channel room
    this.messagesGateway.emitNewMessage(channelId, formatted);

    return formatted;
  }

  // ─── Get Messages (with cursor pagination) ──────────────────────────────────
  async getMessages(channelId: string, query: GetMessagesDto, userId: string) {
    if (!Types.ObjectId.isValid(channelId)) throw new NotFoundException('Channel not found');

    // Only members can read messages
    await this.channelsService.verifyMembership(channelId, userId);

    // Verify channel exists
    const channel = await this.channelModel.findById(channelId);
    if (!channel) throw new NotFoundException('Channel not found');

    const limit = query.limit ?? 50;

    // Cursor-based pagination
    let filter: any = { channelId: new Types.ObjectId(channelId) };
    if (query.before) {
      filter._id = { $lt: new Types.ObjectId(query.before) };
    }

    const messages = await this.messageModel
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const formatted = messages.map((msg) => this.formatMessage(msg));

    return {
      messages: formatted.reverse(), // return in chronological order
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[messages.length - 1]._id : null,
    };
  }

  // ─── Delete Message ─────────────────────────────────────────────────────────
  async deleteMessage(messageId: string, userId: string) {
    if (!Types.ObjectId.isValid(messageId)) throw new NotFoundException('Message not found');

    const message = await this.messageModel.findById(messageId);

    if (!message) throw new NotFoundException('Message not found');

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageModel.findByIdAndDelete(messageId);

    // Notify connected clients that message was deleted
    this.messagesGateway.emitMessageDeleted(message.channelId.toString(), messageId);

    return { message: 'Message deleted successfully' };
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────
  private formatMessage(message: any) {
    return {
      id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      channelId: message.channelId,
      senderId: message.senderId,
    };
  }
}
