import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { AuthService } from 'src/auth/auth.service';
import { Server, Socket } from 'socket.io';
import { User } from '@prisma/client';


interface Chat {
  text: string;
}

@WebSocketGateway(3000, {
  namespace: 'chat',
  cors: [
    '*'
  ]
}) 
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() 
  server: Server;

  constructor(
    private redisService: RedisService,
    private authService: AuthService
  ) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: Chat): Promise<void> {

    const token = client.handshake.query.token as string;
    try {
      const user: User = await this.authService.getUserWithJwt(token);
      if (user) {
        try {
          const myHeaders = new Headers();
          myHeaders.append('Content-Type', 'application/json');
          const response = await fetch('http://localhost:9999/api/chat', {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({
              "message": payload.text
            }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          this.server.emit('response', {
            data: data["response"]
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      } else {
        console.warn('Invalid token, rejecting message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  afterInit(server: Server) {
    console.log('WebSocket сервер инициализирован');
  }

  async handleDisconnect(client: Socket) {
    await this.redisService.hdel('users', client.id);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.query.token as string;
    try {
      const user: User = await this.authService.getUserWithJwt(token);
      if (!user) {
        return;
      }
      const userData = {
        id: client.id,
        handshake: client.handshake,
        isSenior: user.isSenior
      };

      await this.redisService.hset('users', client.id, JSON.stringify(userData));
    } catch (err) {
      console.warn(err)
    }
  }
}
