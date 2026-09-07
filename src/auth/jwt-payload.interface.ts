import { RolUsuario } from '../usuario/entities/usuario.entity';

export interface PayloadJwt {
  sub: number;
  email: string;
  rol: RolUsuario;
}
