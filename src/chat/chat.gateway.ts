import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import axios from 'axios';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: any) {
    const message = payload.message || 'расскажи сказку';
    const requestBody = {
      model: 'llama3',
      prompt: message,
      stream: false,
    };

    try {
      const response = await axios.post(
        'http://localhost:11434/api/generate',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Send the response back to the client
      client.emit('messageResponse', response.data);
    } catch (error) {
      console.error('Error while generating story:', error);
      client.emit('messageResponse', { error: 'Failed to generate story' });
    }
  }
}
