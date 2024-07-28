import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        if (context.getType().toString() === 'ws') {
            const client = context.switchToWs().getClient();
            const token = client.handshake.auth.token || client.handshake.headers['authorization'];

            if (!token) {
                throw new WsException('Unauthorized');
            }
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new WsException('Unauthorized');
        }
        return user;
    }
}
