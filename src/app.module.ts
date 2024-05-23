import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [UsersModule, AuthModule, RatingModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
