import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { RatingModule } from './rating/rating.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [UsersModule, AuthModule, ChatModule, RedisModule, RatingModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
