import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaService } from './categoria.service';

describe('CategoriaService', () => {
  let service: CategoriaService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const categoria = { id: 1, nombre: 'Bebidas', productos: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaService,
        {
          provide: 'CategoriaRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriaService>(CategoriaService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una categoria', async () => {
      mockRepository.create.mockReturnValue(categoria);
      mockRepository.save.mockResolvedValue(categoria);

      const result = await service.create({ nombre: 'Bebidas' });

      expect(mockRepository.create).toHaveBeenCalledWith({ nombre: 'Bebidas' });
      expect(mockRepository.save).toHaveBeenCalledWith(categoria);
      expect(result).toEqual(categoria);
    });
  });

  describe('findAll', () => {
    it('debe devolver todas las categorias', async () => {
      mockRepository.find.mockResolvedValue([categoria]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual([categoria]);
    });
  });

  describe('findOne', () => {
    it('debe devolver una categoria existente', async () => {
      mockRepository.findOne.mockResolvedValue(categoria);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { productos: true },
      });
      expect(result).toEqual(categoria);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una categoria existente', async () => {
      const updated = { ...categoria, nombre: 'Comidas' };
      mockRepository.findOne.mockResolvedValue(categoria);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { nombre: 'Comidas' });

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...categoria,
        nombre: 'Comidas',
      });
      expect(result).toEqual(updated);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'Comidas' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una categoria existente', async () => {
      mockRepository.findOne.mockResolvedValue(categoria);
      mockRepository.remove.mockResolvedValue(categoria);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(categoria);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
