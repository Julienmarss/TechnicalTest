import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new Error('Mot de passe ou email invalid, imagine tu connais pas tes accès...');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.createUser(registerDto.email, registerDto.password);
        return this.authService.login(user);
    }

    @UseGuards(AuthGuard('google'))
    @Get('google')
    googleAuth() {}

    @UseGuards(AuthGuard('google'))
    @Get('google/callback')
    googleAuthRedirect(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(AuthGuard('linkedin'))
    @Get('linkedin')
    linkedinAuth() {}

    @UseGuards(AuthGuard('linkedin'))
    @Get('linkedin/callback')
    linkedinAuthRedirect(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
