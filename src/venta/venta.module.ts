import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaService } from './venta.service';
import { VentasController } from './venta.controller';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from '../detalle-venta/entities/detalle-venta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { FormaDePago } from '../forma-de-pago/entities/forma-de-pago.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, DetalleVenta, Producto, FormaDePago]),
  ],
  controllers: [VentasController],
  providers: [VentaService],
})
export class VentaModule {}
