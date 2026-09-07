import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ResetToken } from './entities/reset-token.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PayloadJwt } from './jwt-payload.interface';

const HORAS_EXPIRACION = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioService.findByEmailWithPassword(
      loginDto.email,
    );

    if (
      !usuario ||
      !(await bcrypt.compare(loginDto.password, usuario.password))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const payload: PayloadJwt = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async solicitarRecuperacion({ email }: ForgotPasswordDto): Promise<{
    mensaje: string;
    enlace?: string;
  }> {
    const usuario = await this.usuarioService.findByEmail(email);
    if (!usuario || !usuario.activo) {
      return {
        mensaje:
          'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiraEn = new Date(Date.now() + HORAS_EXPIRACION * 3600_000);

    await this.resetTokenRepository.save(
      this.resetTokenRepository.create({ token, usuario, expiraEn }),
    );

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const enlace = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.enviarRecuperacionContrasena(usuario.email, enlace);

    return {
      mensaje:
        'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
      enlace,
    };
  }

  async restablecerContrasena({
    token,
    nuevaPassword,
  }: ResetPasswordDto): Promise<{ mensaje: string }> {
    const registro = await this.resetTokenRepository.findOne({
      where: { token, usado: false },
      relations: { usuario: true },
    });

    if (!registro || registro.expiraEn < new Date()) {
      throw new BadRequestException(
        'El enlace es inválido o ya expiró. Solicita uno nuevo.',
      );
    }

    const usuario = registro.usuario;
    await this.usuarioService.update(usuario.id, {
      password: nuevaPassword,
    });

    await this.resetTokenRepository.update(registro.id, { usado: true });

    return { mensaje: 'Tu contraseña se actualizó correctamente.' };
  }
}
