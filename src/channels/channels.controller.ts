import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  /**
   * POST /channels
   * Create a new channel. Creator is automatically added as a member.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChannel(
    @Body() dto: CreateChannelDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.channelsService.createChannel(dto, user.id);
  }

  /**
   * GET /channels
   * List all channels. Includes isMember flag for the current user.
   */
  @Get()
  async getAllChannels(@CurrentUser() user: { id: string }) {
    return this.channelsService.getAllChannels(user.id);
  }

  /**
   * GET /channels/:channelId
   * Get a single channel by ID.
   */
  @Get(':channelId')
  async getChannel(
    @Param('channelId') channelId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.channelsService.getChannelById(channelId, user.id);
  }

  /**
   * POST /channels/:channelId/join
   * Join a channel as a member.
   */
  @Post(':channelId/join')
  @HttpCode(HttpStatus.OK)
  async joinChannel(
    @Param('channelId') channelId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.channelsService.joinChannel(channelId, user.id);
  }

  /**
   * DELETE /channels/:channelId/leave
   * Leave a channel (creator cannot leave).
   */
  @Delete(':channelId/leave')
  @HttpCode(HttpStatus.OK)
  async leaveChannel(
    @Param('channelId') channelId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.channelsService.leaveChannel(channelId, user.id);
  }

  /**
   * GET /channels/:channelId/members
   * Get all members of a channel (must be a member to view).
   */
  @Get(':channelId/members')
  async getChannelMembers(
    @Param('channelId') channelId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.channelsService.getChannelMembers(channelId, user.id);
  }
}
