import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export const WebsocketAuthMiddleware = (jwtService: JwtService) => {
    return (client: Socket, next) => {
        try {
            const token = client.handshake.auth.token || client.handshake.headers['authorization'];
            const payload = jwtService.verify(token);
            client.data.user = payload;
            next();
        } catch (error) {
            next(new WsException('Unauthorized'));
        }
    };
};