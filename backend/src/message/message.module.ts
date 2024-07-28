import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { MessageController } from './message.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzIyMDA0MDYwLCJleHAiOjE3MjIwMDc2NjB9.oWe8YDYdyeJltZhafuGnR7b7JflHrmHKjKXcJ96U4jY',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    providers: [MessageService, MessageGateway],
    controllers: [MessageController],
    exports: [MessageService],
})
export class MessageModule {}