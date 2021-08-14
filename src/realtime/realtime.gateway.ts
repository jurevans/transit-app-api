import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
import { StationsService } from './stations/stations.service';

@WebSocketGateway({ cors: true })
export class RealtimeGateway {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly stationsService: StationsService,
  ){}

  @SubscribeMessage('trip_updates')
  async listenForStationId(
    @MessageBody() data: { stationId: string, feedIndex: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { stationId, feedIndex } = data;
    this.logger.log('Data', data);

    const transfers = await this.stationsService.getTransfers(feedIndex);
    const stationIds = transfers[stationId] || [stationId];

    const tripUpdates = await this.realtimeService.getTripUpdates({ feedIndex, stationIds });
    socket.emit('recieved_trip_updates', tripUpdates);
  }
}
