import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { password, ...data } = createUsuarioDto;

    const existe = await this.usuarioRepository.findOneBy({
      email: data.email,
    });
    if (existe) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${data.email}`,
      );
    }

    const usuario = this.usuarioRepository.create({
      ...data,
      password: await bcrypt.hash(password, 10),
    });
    const guardado = await this.usuarioRepository.save(usuario);
    return this.findOne(guardado.id);
  }

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return usuario;
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOneBy({ email });
  }

  findByEmailWithPassword(email: string): Promise<Usuario | null> {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password')
      .where('usuario.email = :email', { email })
      .getOne();
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);

    const { password, ...data } = updateUsuarioDto;
    if (password !== undefined) {
      usuario.password = await bcrypt.hash(password, 10);
    }
    Object.assign(usuario, data);

    const guardado = await this.usuarioRepository.save(usuario);
    return this.findOne(guardado.id);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }
}
