import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from './message.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
    constructor(private messageService: MessageService) {}

    @Get()
    async getAllMessages(@Request() req) {
        return this.messageService.getAllMessages();
    }

    @Get(':userId')
    async getMessagesWith(@Param('userId') userId: string, @Request() req) {
        return this.messageService.getMessagesBetweenUsers(req.user.id, userId);
    }

    @Post()
    async createMessage(@Body() createMessageDto: { receiverId: string, content: string }, @Request() req) {
        return this.messageService.createMessage(req.user.id, createMessageDto.receiverId, createMessageDto.content);
    }
}