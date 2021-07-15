import { Controller, Get, Param } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { Routes } from 'src/models/entities/routes.entity';

@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  async findAll(): Promise<Routes[]> {
    return this.routesService.findAll();
  }

  @Get(':routeId')
  async findOne(@Param('routeId') routeId: string): Promise<Routes> {
    return this.routesService.findOne(routeId);
  }
}
