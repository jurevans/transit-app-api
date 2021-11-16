import {
  Controller,
  Get,
  Param,
  Query,
  CacheTTL,
  ParseIntPipe,
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ShapesService } from './shapes.service';
import { StopsService } from './stops.service';
import { Stops } from 'src/entities/stops.entity';
import {
  FeatureCollection,
  LineString,
} from 'src/geo/interfaces/geojson.interface';
import { IShape } from './interfaces/shapes.interface';
import { IStop } from './interfaces/stops.interface';
import { CacheTtlSeconds } from 'src/constants';

@Controller('geo')
export class GeoController {
  constructor(
    private shapesService: ShapesService,
    private stopsService: StopsService,
  ) {}

  @Get(':feedIndex/shapes')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  findShapes(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Query('day') day?: string,
    @Query('geojson', new DefaultValuePipe(false), ParseBoolPipe)
    geojson?: boolean,
  ): Promise<FeatureCollection | IShape[]> {
    return this.shapesService.findShapes({
      feedIndex,
      day,
      geojson,
    });
  }

  @Get(':feedIndex/shapes/:shapeId')
  find(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Param('shapeId') shapeId: string,
  ): Promise<LineString> {
    return this.shapesService.find({ feedIndex, shapeId });
  }

  @Get(':feedIndex/stops')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  findAll(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Query('day') day?: string,
    @Query('geojson', new DefaultValuePipe(false), ParseBoolPipe)
    geojson?: boolean,
  ): Promise<FeatureCollection | IStop[]> {
    return this.stopsService.findAll({ feedIndex, day, geojson });
  }

  @Get(':feedIndex/stops/:stopId')
  findOne(
    @Param('feedIndex', ParseIntPipe) feedIndex: number,
    @Param('stopId') stopId: string,
  ): Promise<Stops> {
    return this.stopsService.findOne({ feedIndex, stopId });
  }
}
