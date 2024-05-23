import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [RedisModule],
    providers: [ChatGateway, PrismaService, AuthService, UsersService, JwtService]
})
export class ChatModule {}
