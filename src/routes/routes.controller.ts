import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { Routes } from 'src/models/entities/routes.entity';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  findAll(@Query('day') day?: string,): Promise<any[]> {
    return this.routesService.findAll(day);
  }

  @Get(':routeId')
  async findOne(
      @Param('routeId') routeId: string,
      @Query('day') day?: string,
    ): Promise<Routes> {
    const routes = await this.routesService.findOne({ routeId, day });
    if (!routes) {
      throw new NotFoundException();
    }
    return routes;
  }

}
