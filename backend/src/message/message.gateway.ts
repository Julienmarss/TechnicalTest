import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageService } from './message.service';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MessageGateway {
    @WebSocketServer() server: Server;
    private logger = new Logger('MessageGateway');

    constructor(
        private messageService: MessageService,
        private jwtService: JwtService
    ) {}

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody() data: { receiverId: string; content: string },
        @ConnectedSocket() client: Socket
    ) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            const senderId = payload.sub;

            if (senderId === data.receiverId) {
                this.logger.warn('ça fait une erreur dans la console quand tu envoie un message à toi même');
                return { error: "Cannot send message to yourself" };
            }

            const message = await this.messageService.createMessage(senderId, data.receiverId, data.content);

            this.logger.log(`message envoyé ?`, message);

            this.server.to(senderId).emit('newMessage', message);

            this.server.to(data.receiverId).emit('newMessage', message);

            this.logger.log(`Message envoyé de ${senderId} à ${data.receiverId}`);
            return message;
        } catch (error) {
            this.logger.error('Erreur dans handleSendMessage:', error.message);
            return { error: "Erreur va trouver un fix" };
        }
    }
}