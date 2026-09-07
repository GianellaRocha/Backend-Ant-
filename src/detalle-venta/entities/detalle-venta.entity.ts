import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Venta } from '../../venta/entities/venta.entity';

@Entity()
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @ManyToOne(() => Producto, (producto) => producto.detalleVentas)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Venta, (venta) => venta.detalles)
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;
}
