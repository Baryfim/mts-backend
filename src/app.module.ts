import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
