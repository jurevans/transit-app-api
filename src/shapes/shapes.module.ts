import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShapesService } from './shapes.service';
import { ShapesController } from './shapes.controller';
import { Shapes } from 'src/models/entities/shapes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shapes])],
  exports: [TypeOrmModule],
  providers: [ShapesService],
  controllers: [ShapesController],
})
export class ShapesModule {}
