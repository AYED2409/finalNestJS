import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';


@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;
  constructor(private readonly chatService: ChatService) {}
  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      const { name, token } = socket.handshake.auth;
      //console.log('cliente conectado:', socket);
      // console.log(name, token);
      if (!name) {
        socket.disconnect();
        return;
      }
      // agregar el cliente al listado
      this.chatService.onClientConnected({ id: socket.id, name });

      //mensaje de bienvenida cuando se conecta un cliente
      socket.emit('welcome-messsage', 'Bienvenido al servidor');

      //servidor envia a todos los clientes conectados el mensaje 'on-clients-changed'
      this.server.emit('on-clients-changed', this.chatService.getClients());

      //desconexion de un cliente
      socket.on('disconnect', () => {
        this.chatService.onClientDisconnected(socket.id);
        console.log('cliente desconectado:', socket.id);
        this.server.emit('on-clients-changed', this.chatService.getClients());
      });

    });
  }

// mensajes recibidos de los clientes
  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { name, token } = client.handshake.auth;
    console.log({ name, message });
    if (!message) {
      return;
    }
    //envia el mensaje a todos los clientes
    this.server.emit('on-message', {
      userId: client.id,
      message: message,
      name: name,
    });
  }
}
