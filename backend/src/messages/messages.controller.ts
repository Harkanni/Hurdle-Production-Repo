import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { GetMessagesDto } from './dto/get-messages.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('channels/:channelId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * POST /channels/:channelId/messages
   * Send a message to a channel. User must be a member.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('channelId') channelId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.messagesService.sendMessage(channelId, dto, user.id);
  }

  /**
   * GET /channels/:channelId/messages
   * Get message history for a channel (cursor-based pagination).
   * Query params: limit (default 50), before (message ID cursor)
   */
  @Get()
  async getMessages(
    @Param('channelId') channelId: string,
    @Query() query: GetMessagesDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.messagesService.getMessages(channelId, query, user.id);
  }

  /**
   * DELETE /channels/:channelId/messages/:messageId
   * Delete a message. Only the sender can delete their own message.
   */
  @Delete(':messageId')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.messagesService.deleteMessage(messageId, user.id);
  }
}
