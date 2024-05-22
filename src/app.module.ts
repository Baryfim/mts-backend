import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
