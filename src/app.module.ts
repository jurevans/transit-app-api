import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StopsController } from './stops/stops.controller';
import { StopsService } from './stops/stops.service';
import { StopsModule } from './stops/stops.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection, getConnectionOptions } from 'typeorm';
import { AgencyController } from './agency/agency.controller';
import { AgencyService } from './agency/agency.service';
import * as ormconfig from '../ormconfig';
import { AgencyModule } from './agency/agency.module';

TypeOrmModule.forRootAsync({
  useFactory: async () =>
    Object.assign(await getConnectionOptions(), {
      ...ormconfig,
      autoLoadEntities: true,
    }),
});

@Module({
  imports: [TypeOrmModule.forRoot(), AgencyModule, StopsModule ],
  controllers: [AppController, AgencyController, StopsController],
  providers: [AppService, AgencyService, StopsService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
