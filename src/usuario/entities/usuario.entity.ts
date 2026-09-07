import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResetToken } from '../../auth/entities/reset-token.entity';

export enum RolUsuario {
  ADMIN = 'admin',
  EMPLEADO = 'empleado',
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ enum: RolUsuario, default: RolUsuario.EMPLEADO })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ResetToken, (resetToken) => resetToken.usuario)
  resetTokens: ResetToken[];
}
