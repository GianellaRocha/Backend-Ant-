import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { Imagen } from '../../imagen/entities/imagen.entity';
import { DetalleVenta } from '../../detalle-venta/entities/detalle-venta.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column('float')
  precio: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @OneToMany(() => Imagen, (imagen) => imagen.producto, { cascade: true })
  imagenes: Imagen[];

  @OneToMany(() => DetalleVenta, (detalle) => detalle.producto)
  detalleVentas: DetalleVenta[];
}
