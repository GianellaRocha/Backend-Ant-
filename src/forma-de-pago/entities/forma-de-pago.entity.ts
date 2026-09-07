import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';

@Entity()
export class FormaDePago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Venta, (venta) => venta.formaDePago)
  ventas: Venta[];
}
