import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';

// Интерфейс для сообщения чата
interface Chat {
  id: number;
  text: string;
}

@WebSocketGateway(3000, {
  namespace: 'chat'
}) 
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() 
  server: Server;

  constructor(private redisService: RedisService) {}

  // Обработчик события 'sendMessage'
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: Chat): Promise<void> {
    console.log(payload); // Логируем полученное сообщение
    this.server.emit('recMessage', payload); // Отправляем сообщение всем клиентам
  }

  // Метод, вызываемый после инициализации
  afterInit(server: Server) {
    console.log('WebSocket сервер инициализирован');
  }

  // Метод, вызываемый при отключении клиента
  handleDisconnect(client: Socket) {
    console.log(`Клиент отключился: ${client.id}`);
    console.log(JSON.stringify(client))
  }

  // Метод, вызываемый при подключении клиента
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Клиент подключился: ${client.id}`);
  }
}
