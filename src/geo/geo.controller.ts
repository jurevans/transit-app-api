import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  CacheTTL,
} from '@nestjs/common';
import { ShapesService } from './shapes.service';
import { StopsService } from './stops.service';
import { Stops } from 'src/entities/stops.entity';
import { FeatureCollection, LineString } from 'src/interfaces/geojson';
import { ShapeRawData, StopRawData } from 'src/interfaces/data';
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
    @Param('feedIndex') feedIndex: number,
    @Query('day') day?: string,
    @Query('geojson') geojson?: string,
  ): Promise<FeatureCollection | ShapeRawData> {
    return this.shapesService.findShapes({ feedIndex, day, geojson });
  }

  @Get(':feedIndex/shapes/:shapeId')
  async find(
    @Param('feedIndex') feedIndex: number,
    @Param('shapeId') shapeId: string,
  ): Promise<LineString> {
    const shapes = await this.shapesService.find({ feedIndex, shapeId });
    if (!shapes) {
      throw new NotFoundException();
    }
    return shapes;
  }

  @Get(':feedIndex/stops')
  @CacheTTL(CacheTtlSeconds.ONE_DAY)
  async findAll(
    @Param('feedIndex') feedIndex: number,
    @Query('day') day?: string,
    @Query('geojson') geojson?: string,
  ): Promise<FeatureCollection | StopRawData> {
    return this.stopsService.findAll({ feedIndex, day, geojson });
  }

  @Get(':feedIndex/stops/:stopId')
  async findOne(
    @Param('feedIndex') feedIndex: number,
    @Param('stopId') stopId: string,
  ): Promise<Stops> {
    const stop = await this.stopsService.findOne({ feedIndex, stopId });
    if (!stop) {
      throw new NotFoundException();
    }
    return stop;
  }
}
