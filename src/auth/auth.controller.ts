import { Body, Controller, Get, Post, Req, Res, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshTokenGuard } from './jwt-refresh-token.guard';
import { LocalAuthGuard } from './local.auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('/')
    @UseGuards(LocalAuthGuard)
    async auth() { }

    @Post('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any) {
        return this.authService.buildProfileResponse(req.user);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    async checkAccessToken(@Req() req: any) {
        return {};
    }

    // @Post('create')
    // @UseGuards(LocalAuthGuard)
    // async createUser(@Req() req: any, @Body() ) {
    //     return this.authService.createUserWithCredentials();
    // }

    @Post('refresh')
    @UseGuards(JwtRefreshTokenGuard)
    async refreshToken(@Req() req: any) {
        const [authType, authJwtToken] = req.headers.authorization.split(" ");
        if (authType != "Bearer") {
            throw new UnprocessableEntityException();
        }
        return await this.authService.buildRefreshResponse(req.user, authJwtToken.trim());
    }
}