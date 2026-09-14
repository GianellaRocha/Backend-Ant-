import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

@Entity()
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'text' })
  imagen?: string;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}
