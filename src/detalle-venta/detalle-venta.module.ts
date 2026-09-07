import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVentaService } from './detalle-venta.service';
import { DetallesVentaController } from './detalle-venta.controller';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Venta } from '../venta/entities/venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta, Producto, Venta])],
  controllers: [DetallesVentaController],
  providers: [DetalleVentaService],
})
export class DetalleVentaModule {}
