import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

@Entity()
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'text' })
  imagen?: string;

  @ManyToOne(() => Categoria, (categoria) => categoria.hijos, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoria_padre_id' })
  padre?: Categoria;

  @OneToMany(() => Categoria, (categoria) => categoria.padre)
  hijos: Categoria[];

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}