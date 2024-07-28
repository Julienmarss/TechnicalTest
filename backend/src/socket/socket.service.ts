import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
    private server: Server;
    private userSocketMap: Map<string, string> = new Map();
    private socketUserMap: Map<string, string> = new Map();
    private logger = new Logger('SocketService');

    setServer(server: Server) {
        this.server = server;
    }

    addUser(userId: string, socketId: string) {
        this.userSocketMap.set(userId, socketId);
        this.socketUserMap.set(socketId, userId);
    }

    removeUser(userId: string) {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            this.socketUserMap.delete(socketId);
            this.userSocketMap.delete(userId);
        }
    }

    getUserIdBySocketId(socketId: string): string | undefined {
        return this.socketUserMap.get(socketId);
    }

    emitToUser(userId: string, event: string, data: any) {
        const socketId = this.userSocketMap.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        } else {
            this.logger.warn(`émettre ${event} au user ${userId}: socket non trouvé`);
        }
    }
}