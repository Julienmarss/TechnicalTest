import { Injectable } from '@nestjs/common';

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
}

@Injectable()
export class MessageService {
    private messages: Message[] = [];

    async getAllMessages(): Promise<Message[]> {
        return this.messages;
    }

    async createMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
        };
        this.messages.push(newMessage);
        return newMessage;
    }

    async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
        return this.messages.filter(
            msg =>
                (msg.senderId === userId1 && msg.receiverId === userId2) ||
                (msg.senderId === userId2 && msg.receiverId === userId1)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
}