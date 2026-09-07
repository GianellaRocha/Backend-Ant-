import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UsuarioService } from './usuario.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hash_secreto'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsuarioService', () => {
  let service: UsuarioService;

  const mockUsuarioRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const usuario = {
    id: 1,
    nombre: 'Admin',
    email: 'admin@antu.com',
    rol: 'admin',
    activo: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: 'UsuarioRepository',
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un usuario con password hasheado', async () => {
      const dto = {
        nombre: 'Admin',
        email: 'admin@antu.com',
        password: 'secreto',
      };
      mockUsuarioRepository.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(usuario);
      mockUsuarioRepository.create.mockReturnValue({ ...usuario });
      mockUsuarioRepository.save.mockResolvedValue({ ...usuario, id: 1 });

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('secreto', 10);
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
        nombre: 'Admin',
        email: 'admin@antu.com',
        password: 'hash_secreto',
      });
      expect(result).toEqual(usuario);
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(usuario);

      await expect(
        service.create({
          nombre: 'Admin',
          email: 'admin@antu.com',
          password: 'secreto',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('debe devolver todos los usuarios', async () => {
      mockUsuarioRepository.find.mockResolvedValue([usuario]);

      const result = await service.findAll();

      expect(result).toEqual([usuario]);
    });
  });

  describe('findOne', () => {
    it('debe devolver un usuario existente', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(usuario);

      const result = await service.findOne(1);

      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(usuario);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmailWithPassword', () => {
    it('debe consultar incluyendo el password', async () => {
      const qb = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(usuario),
      };
      mockUsuarioRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findByEmailWithPassword('admin@antu.com');

      expect(mockUsuarioRepository.createQueryBuilder).toHaveBeenCalledWith(
        'usuario',
      );
      expect(qb.addSelect).toHaveBeenCalledWith('usuario.password');
      expect(qb.where).toHaveBeenCalledWith('usuario.email = :email', {
        email: 'admin@antu.com',
      });
      expect(result).toEqual(usuario);
    });
  });

  describe('update', () => {
    it('debe actualizar datos y hashear el nuevo password', async () => {
      const actualizado = { ...usuario, nombre: 'Super Admin' };
      mockUsuarioRepository.findOneBy
        .mockResolvedValueOnce(usuario)
        .mockResolvedValueOnce(actualizado);
      mockUsuarioRepository.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.update(1, {
        nombre: 'Super Admin',
        password: 'nuevo',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('nuevo', 10);
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith({
        ...usuario,
        nombre: 'Super Admin',
        password: 'hash_secreto',
      });
      expect(result).toEqual(actualizado);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un usuario existente', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(usuario);
      mockUsuarioRepository.remove.mockResolvedValue(usuario);

      await service.remove(1);

      expect(mockUsuarioRepository.remove).toHaveBeenCalledWith(usuario);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
