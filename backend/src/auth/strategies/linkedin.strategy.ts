import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            clientID: configService.get<string>('LINKEDIN_CLIENT_ID'),
            clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET'),
            callbackURL: 'http://localhost:3000/auth/linkedin/callback',
            scope: ['r_emailaddress', 'r_liteprofile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
        const { emails } = profile;
        const user = await this.authService.findOrCreateUser(emails[0].value, profile.id, 'linkedin');
        done(null, user);
    }
}