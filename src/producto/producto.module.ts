import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './producto.service';
import { ProductosController } from './producto.controller';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  controllers: [ProductosController],
  providers: [ProductoService],
})
export class ProductoModule {}
