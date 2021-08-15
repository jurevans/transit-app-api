import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
import { StationsService } from './stations/stations.service';

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly stationsService: StationsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ){}

  @SubscribeMessage('trip_updates')
  async listenForTripUpdates(
    @MessageBody() data: { stationId: string, feedIndex: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { stationId, feedIndex } = data;
    //this.logger.log('Data', data);
    const transfers = await this.stationsService.getTransfers(feedIndex);
    const stationIds = transfers[stationId] || [stationId];

    this.addInterval('gtfs-realtime-updates', 30000, async () => {
      this.logger.log('Sending new trip updates!');
      const tripUpdates = await this.realtimeService.getTripUpdates({ feedIndex, stationIds });
      socket.emit('received_trip_updates', {
        stationId,
        transfers: stationIds,
        ...tripUpdates,
      });
    });
  }

  @SubscribeMessage('cancel_trip_updates')
  listenForCancelTripUpdates() {
    this.logger.log('Reset trip updates interval');
    this.deleteInterval('gtfs-realtime-updates');
  }

  addInterval(name: string, ms: number, callback: any) {
    callback();
    const interval = setInterval(callback, ms);
    this.deleteInterval(name);
    this.schedulerRegistry.addInterval(name, interval);
  }

  deleteInterval(name: string) {
    if (this.schedulerRegistry.doesExists('interval', name)) {
      this.schedulerRegistry.deleteInterval(name);
    }
  }

  handleDisconnect() {
    this.logger.warn('Socket disconnected!');
    try {
      this.schedulerRegistry.deleteInterval('gtfs-realtime-updates');
    } catch (e) {
      this.logger.warn('Interval did not die gracefully');
    }
  }

  handleConnection() {
    this.logger.log('Socket connected!');
  }
}
