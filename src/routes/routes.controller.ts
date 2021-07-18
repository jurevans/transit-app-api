import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Routes } from 'src/models/entities/routes.entity';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  findAll(): Promise<any[]> {
    return this.routesService.findAll();
  }

  @Get(':routeId')
  async findOne(@Param('routeId') routeId: string): Promise<Routes> {
    const routes = await this.routesService.findOne(routeId);
    if (!routes) {
      throw new NotFoundException();
    }
    return routes;
  }
}
