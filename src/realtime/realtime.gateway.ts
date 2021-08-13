import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({ cors: true })
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
  ){}

  @SubscribeMessage('trip_updates')
  async listenForStationId(
    @MessageBody() data: { stationId: string, feedIndex: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { stationId, feedIndex } = data;
    this.logger.log('Data', data);
    const results = await this.realtimeService.findByStationId({ feedIndex, stationId });
    socket.emit('recieved_trip_updates', results);
  }
}
