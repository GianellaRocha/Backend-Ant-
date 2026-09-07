import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagenService } from './imagen.service';
import { ImagenesController } from './imagen.controller';
import { Imagen } from './entities/imagen.entity';
import { Producto } from '../producto/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Imagen, Producto])],
  controllers: [ImagenesController],
  providers: [ImagenService],
})
export class ImagenModule {}
