import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateChannelDto } from './dto/create-channel.dto.js';
import { Channel, ChannelDocument } from './schemas/channel.schema.js';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
  ) {}

  // ─── Create Channel ────────────────────────────────────────────────────────
  async createChannel(dto: CreateChannelDto, userId: string) {
    const existing = await this.channelModel.findOne({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Channel with name "${dto.name}" already exists`,
      );
    }

    const newChannel = await this.channelModel.create({
      name: dto.name,
      description: dto.description,
      createdById: new Types.ObjectId(userId),
      members: [{ userId: new Types.ObjectId(userId) }],
    });

    return this.formatChannel(newChannel);
  }

  // ─── Get All Channels ───────────────────────────────────────────────────────
  async getAllChannels(userId: string) {
    const channels = await this.channelModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return channels.map((channel: any) => {
      const isMember = channel.members.some(
        (m: any) => m.userId.toString() === userId,
      );

      return {
        id: channel._id,
        name: channel.name,
        description: channel.description,
        createdAt: channel.createdAt,
        createdById: channel.createdById,
        memberCount: channel.members.length,
        messageCount: 0,
        isMember,
      };
    });
  }

  // ─── Get Single Channel ─────────────────────────────────────────────────────
  async getChannelById(channelId: string, userId: string) {
    if (!Types.ObjectId.isValid(channelId))
      throw new NotFoundException('Channel not found');

    const channel = await this.channelModel.findById(channelId).lean();

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const isMember = channel.members.some(
      (m: any) => m.userId.toString() === userId,
    );

    return {
      id: channel._id,
      name: channel.name,
      description: channel.description,
      createdAt: channel.createdAt,
      createdBy: channel.createdById,
      memberCount: channel.members.length,
      messageCount: 0,
      isMember,
    };
  }

  // ─── Join Channel ───────────────────────────────────────────────────────────
  async joinChannel(channelId: string, userId: string) {
    if (!Types.ObjectId.isValid(channelId))
      throw new NotFoundException('Channel not found');

    const channel = await this.channelModel.findById(channelId);
    if (!channel) throw new NotFoundException('Channel not found');

    const isMember = channel.members.some(
      (m) => m.userId.toString() === userId,
    );

    if (isMember) {
      throw new ConflictException('You are already a member of this channel');
    }

    channel.members.push({
      userId: new Types.ObjectId(userId),
      joinedAt: new Date(),
    });
    await channel.save();

    return {
      message: `Successfully joined channel "${channel.name}"`,
      channelId: channel._id,
      channelName: channel.name,
    };
  }

  // ─── Leave Channel ──────────────────────────────────────────────────────────
  async leaveChannel(channelId: string, userId: string) {
    if (!Types.ObjectId.isValid(channelId))
      throw new NotFoundException('Channel not found');

    const channel = await this.channelModel.findById(channelId);
    if (!channel) throw new NotFoundException('Channel not found');

    if (channel.createdById.toString() === userId) {
      throw new ForbiddenException('Channel creator cannot leave the channel');
    }

    const memberIndex = channel.members.findIndex(
      (m) => m.userId.toString() === userId,
    );

    if (memberIndex === -1) {
      throw new NotFoundException('You are not a member of this channel');
    }

    channel.members.splice(memberIndex, 1);
    await channel.save();

    return { message: `Successfully left channel "${channel.name}"` };
  }

  // ─── Get Channel Members ────────────────────────────────────────────────────
  async getChannelMembers(channelId: string, userId: string) {
    await this.verifyMembership(channelId, userId);

    const channel = await this.channelModel
      .findById(channelId)
      .populate('members.userId', 'displayName email')
      .lean();

    if (!channel) throw new NotFoundException('Channel not found');

    return channel.members.map((m: any) => ({
      userId: m.userId._id,
      displayName: m.userId.displayName,
      email: m.userId.email,
      joinedAt: m.joinedAt,
    }));
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────
  async verifyMembership(channelId: string, userId: string) {
    if (!Types.ObjectId.isValid(channelId))
      throw new NotFoundException('Channel not found');

    const channel = await this.channelModel.findOne({
      _id: channelId,
      'members.userId': new Types.ObjectId(userId),
    });

    if (!channel) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return channel;
  }

  private formatChannel(channel: any) {
    return {
      id: channel._id,
      name: channel.name,
      description: channel.description,
      createdAt: channel.createdAt,
      isMember: true,
    };
  }
}
