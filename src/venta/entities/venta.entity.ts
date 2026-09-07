import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FormaDePago } from '../../forma-de-pago/entities/forma-de-pago.entity';
import { DetalleVenta } from '../../detalle-venta/entities/detalle-venta.entity';

@Entity()
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cliente: string;

  @Column()
  fecha: Date;

  @Column('float')
  total: number;

  @ManyToOne(() => FormaDePago, (formaDePago) => formaDePago.ventas)
  @JoinColumn({ name: 'forma_de_pago_id' })
  formaDePago: FormaDePago;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];
}
