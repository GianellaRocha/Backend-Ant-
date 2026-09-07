import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { MailService } from '../mail/mail.service';
import { ResetToken } from './entities/reset-token.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUsuarioService = {
    findByEmailWithPassword: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockMailService = {
    enviarRecuperacionContrasena: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:5173'),
  };

  const mockResetTokenRepository = {
    save: jest.fn(),
    create: jest.fn((data: Partial<ResetToken>) => data as ResetToken),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const usuario = {
    id: 1,
    nombre: 'Admin',
    email: 'admin@antu.com',
    password: 'hash',
    rol: 'admin',
    activo: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: 'ResetTokenRepository',
          useValue: mockResetTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash_nuevo');
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debe devolver access_token y usuario sin password', async () => {
      mockUsuarioService.findByEmailWithPassword.mockResolvedValue(usuario);
      mockJwtService.signAsync.mockResolvedValue('token.jwt');

      const result = await service.login({
        email: 'admin@antu.com',
        password: 'secreto',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('secreto', 'hash');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'admin@antu.com',
        rol: 'admin',
      });
      expect(result).toEqual({
        access_token: 'token.jwt',
        usuario: {
          id: 1,
          nombre: 'Admin',
          email: 'admin@antu.com',
          rol: 'admin',
        },
      });
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsuarioService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'admin@antu.com', password: 'secreto' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la password es incorrecta', async () => {
      mockUsuarioService.findByEmailWithPassword.mockResolvedValue(usuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'admin@antu.com', password: 'incorrecta' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario esta inactivo', async () => {
      mockUsuarioService.findByEmailWithPassword.mockResolvedValue({
        ...usuario,
        activo: false,
      });

      await expect(
        service.login({ email: 'admin@antu.com', password: 'secreto' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('solicitarRecuperacion', () => {
    it('debe devolver mensaje genérico si el usuario no existe', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(null);

      const result = await service.solicitarRecuperacion({
        email: 'nadie@antu.com',
      });

      expect(result.mensaje).toContain('Si el correo existe');
      expect(mockResetTokenRepository.save).not.toHaveBeenCalled();
      expect(
        mockMailService.enviarRecuperacionContrasena,
      ).not.toHaveBeenCalled();
    });

    it('debe generar token, guardarlo y enviar el correo', async () => {
      mockUsuarioService.findByEmail.mockResolvedValue(usuario);

      const result = await service.solicitarRecuperacion({
        email: 'admin@antu.com',
      });

      expect(mockResetTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario,
          token: expect.stringMatching(/^[0-9a-f]+$/) as unknown,
          expiraEn: expect.any(Date) as unknown,
        }),
      );
      expect(typeof result.enlace).toBe('string');
      expect(result.enlace).toContain('reset-password?token=');
      expect(mockMailService.enviarRecuperacionContrasena).toHaveBeenCalledWith(
        usuario.email,
        expect.stringContaining('reset-password?token='),
      );
    });
  });

  describe('restablecerContrasena', () => {
    it('debe lanzar error si el token no existe o está usado', async () => {
      mockResetTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        service.restablecerContrasena({
          token: 'invalido',
          nuevaPassword: 'nuevo123',
        }),
      ).rejects.toThrow();
    });

    it('debe lanzar error si el token expiró', async () => {
      mockResetTokenRepository.findOne.mockResolvedValue({
        expiraEn: new Date(Date.now() - 60_000),
        usado: false,
        usuario,
      });

      await expect(
        service.restablecerContrasena({
          token: 'expirado',
          nuevaPassword: 'nuevo123',
        }),
      ).rejects.toThrow();
    });

    it('debe actualizar la password y marcar el token como usado', async () => {
      mockResetTokenRepository.findOne.mockResolvedValue({
        id: 10,
        expiraEn: new Date(Date.now() + 60_000),
        usado: false,
        usuario,
      });
      mockUsuarioService.update.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(
        new Error('hash debería venir de UsuarioService'),
      );

      const result = await service.restablecerContrasena({
        token: 'valido',
        nuevaPassword: 'nuevo123',
      });

      expect(mockUsuarioService.update).toHaveBeenCalledWith(1, {
        password: 'nuevo123',
      });
      expect(mockResetTokenRepository.update).toHaveBeenCalledWith(10, {
        usado: true,
      });
      expect(result.mensaje).toContain('actualizó');
    });
  });
});
