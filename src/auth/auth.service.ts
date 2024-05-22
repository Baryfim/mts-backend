import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { AuthUserCredentials, AuthUserCredentialsPartitial, AuthUserJwtCredentials, CreateUserCredentials } from './auth.types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async authUser(userCredentials: AuthUserCredentialsPartitial): Promise<any> {
        let user = await this.usersService.findOne(userCredentials.login, userCredentials.password);
        return user;
    }

    async createUserWithCredentials(authUserCredentials: AuthUserCredentials, req: any) {
        let user = await this.usersService.findOne(authUserCredentials.login, authUserCredentials.password);
        if (!Boolean(user)) {
            const createUserCredentials: CreateUserCredentials = {
                ...authUserCredentials,
                department: req.user.role,
            };
            user = await this.usersService.createOne(createUserCredentials as AuthUserCredentials);
        }
    }

    async buildJwtPayload(user: User) {
        const payload: AuthUserJwtCredentials = { login: user.login, password: user.password };
        return payload;
    }

    async buildLoginResponse(user: User) {
        return {
            accessToken: await this.getAccessToken(user),
            refreshToken: await this.getRefreshToken(user),
        };
    }

    async buildRefreshResponse(user: User, refreshToken: string) {
        return {
            accessToken: {
                token: await this.getAccessToken(user),
                maxAge: +process.env.JWT_ACCESS_EXPIRATION_TIME,
            },
            refreshToken: {
                token: await this.getRefreshToken(user, refreshToken),
                maxAge: +process.env.JWT_REFRESH_EXPIRATION_TIME
            }
        };
    }

    async getAccessToken(user: User) {
        return this.jwtService.sign(await this.buildJwtPayload(user), {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: +process.env.JWT_ACCESS_EXPIRATION_TIME,
        });
    }

    async getRefreshToken(user: User, oldRefreshToken: string | null = null) {

        const newRefreshToken = this.jwtService.sign(await this.buildJwtPayload(user), {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: +process.env.JWT_REFRESH_EXPIRATION_TIME,
        });

        const savedTokenInDatabase = await this.usersService.updateRefreshTokens(user.login, oldRefreshToken, newRefreshToken);

        if (savedTokenInDatabase) {
            return newRefreshToken;
        }

        throw new UnauthorizedException();
    }

    async buildProfileResponse(user: User) {
        return this.usersService.buildUserResponse(user);
    }
}