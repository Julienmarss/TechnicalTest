import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private socketService: SocketService,
        private jwtService: JwtService
    ) {}

    afterInit(server: Server) {
        this.socketService.setServer(server);
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            this.socketService.addUser(userId, client.id);
            console.log(`User ${userId} connecté avec le socket ${client.id}`);
        } catch (error) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = this.socketService.getUserIdBySocketId(client.id);
        if (userId) {
            this.socketService.removeUser(userId);
            console.log(`User ${userId} deconnecté`);
        }
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, payload: { receiverId: string, content: string }): void {
        const senderId = this.socketService.getUserIdBySocketId(client.id);
        if (senderId) {
            const message = { ...payload, senderId, timestamp: new Date().toISOString() };
            this.socketService.emitToUser(senderId, 'newMessage', message);
            this.socketService.emitToUser(payload.receiverId, 'newMessage', message);
        }
    }
}