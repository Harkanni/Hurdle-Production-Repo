import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChannelsService } from '../channels/channels.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { GetMessagesDto } from './dto/get-messages.dto.js';
import { MessagesGateway } from './messages.gateway.js';
import { Message, MessageDocument } from './schemas/message.schema.js';
import {
  Channel,
  ChannelDocument,
} from '../channels/schemas/channel.schema.js';

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
    if (!Types.ObjectId.isValid(channelId))
      throw new NotFoundException('Channel not found');

    await this.channelsService.verifyMembership(channelId, userId);

    const message = await this.messageModel.create({
      content: dto.content,
      channelId: new Types.ObjectId(channelId),
      senderId: new Types.ObjectId(userId),
    });

    // populate before formatting, so the sender's name comes back
    await message.populate('senderId', 'displayName email');

    const formatted = this.formatMessage(message);
    this.messagesGateway.emitNewMessage(channelId, formatted);
    return formatted;
  }
  // ─── Get Messages (with cursor pagination) ──────────────────────────────────
  async getMessages(channelId: string, query: GetMessagesDto, userId: string) {
    if (!Types.ObjectId.isValid(channelId))
      throw new NotFoundException('Channel not found');

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
      .populate('senderId', 'displayName email') // add this
      .lean();

    const formatted = messages.map((msg) => this.formatMessage(msg));

    return {
      messages: formatted.reverse(),
      hasMore: messages.length === limit,
      nextCursor:
        messages.length > 0 ? messages[messages.length - 1]._id : null,
    };
  }

  // ─── Delete Message ─────────────────────────────────────────────────────────
  async deleteMessage(messageId: string, userId: string) {
    if (!Types.ObjectId.isValid(messageId))
      throw new NotFoundException('Message not found');

    const message = await this.messageModel.findById(messageId);

    if (!message) throw new NotFoundException('Message not found');

    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageModel.findByIdAndDelete(messageId);

    // Notify connected clients that message was deleted
    this.messagesGateway.emitMessageDeleted(
      message.channelId.toString(),
      messageId,
    );

    return { message: 'Message deleted successfully' };
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────
  private formatMessage(message: any) {
    const sender = message.senderId;
    const isPopulated =
      sender && typeof sender === 'object' && sender.displayName;

    return {
      id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      channelId: message.channelId,
      senderId: isPopulated ? sender._id : sender,
      sender: isPopulated
        ? {
            id: sender._id,
            displayName: sender.displayName,
            email: sender.email,
          }
        : null,
    };
  }
}
