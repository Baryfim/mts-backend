import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [UsersModule, AuthModule, ChatModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
