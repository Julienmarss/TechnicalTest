import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const {password, ...result} = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {email: user.email, sub: user.id};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.userService.createUser({email, password: hashedPassword});
        return this.login(user);
    }

    async createUser(email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.userService.createUser({email, password: hashedPassword});
    }

    async findOrCreateUser(email: string, providerId: string, provider: 'google' | 'linkedin') {
        let user = await this.userService.findByEmail(email);
        if (!user) {
            const password = Math.random().toString(36).slice(-8);
            user = await this.userService.createUser({email, password, [provider + 'Id']: providerId});
        }
        return user;
    }
}