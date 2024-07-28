import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
    imports: [
        JwtModule.register({
            secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzIyMDA0MDYwLCJleHAiOjE3MjIwMDc2NjB9.oWe8YDYdyeJltZhafuGnR7b7JflHrmHKjKXcJ96U4jY',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [SocketGateway, SocketService],
    exports: [SocketService],
})
export class SocketModule {}