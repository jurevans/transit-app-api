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
  async listenForStationId(
    @MessageBody() data: { stationId: string, feedIndex: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { stationId, feedIndex } = data;
    //this.logger.log('Data', data);
    const transfers = await this.stationsService.getTransfers(feedIndex);
    const stationIds = transfers[stationId] || [stationId];
    this.schedulerRegistry.getIntervals().forEach((interval: any) => console.log('INTERVAL', interval));
    this.addInterval('gtfs-realtime-updates', 30000, async () => {
      this.logger.log(`${RealtimeGateway.name} sending new trip updates!`);
      const tripUpdates = await this.realtimeService.getTripUpdates({ feedIndex, stationIds });
      socket.emit('recieved_trip_updates', {
        stationId,
        transfers: stationIds,
        ...tripUpdates,
      });
    });
  }

  addInterval(name: string, ms: number, callback: any) {
    callback();
    const interval = setInterval(callback, ms);
    this.schedulerRegistry.addInterval(name, interval);
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
