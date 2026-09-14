import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagenService } from './imagen.service';
import { ImagenesController } from './imagen.controller';
import { Imagen } from './entities/imagen.entity';
import { Producto } from '../producto/entities/producto.entity';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Imagen, Producto]), StorageModule],
  controllers: [ImagenesController],
  providers: [ImagenService],
})
export class ImagenModule {}
