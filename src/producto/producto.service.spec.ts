import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';

describe('ProductoService', () => {
  let service: ProductoService;

  const mockProductoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoriaRepository = {
    findOneBy: jest.fn(),
  };

  const categoria = { id: 1, nombre: 'Bebidas', productos: [] };
  const producto = {
    id: 1,
    nombre: 'Coca',
    descripcion: 'Gaseosa',
    precio: 100,
    categoria,
    imagenes: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: 'ProductoRepository',
          useValue: mockProductoRepository,
        },
        {
          provide: 'CategoriaRepository',
          useValue: mockCategoriaRepository,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un producto con su categoria', async () => {
      const dto = {
        nombre: 'Coca',
        descripcion: 'Gaseosa',
        precio: 100,
        categoriaId: 1,
      };
      mockCategoriaRepository.findOneBy.mockResolvedValue(categoria);
      mockProductoRepository.create.mockReturnValue(producto);
      mockProductoRepository.save.mockResolvedValue(producto);

      const result = await service.create(dto);

      expect(mockCategoriaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockProductoRepository.create).toHaveBeenCalledWith({
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precio: dto.precio,
        categoria,
      });
      expect(result).toEqual(producto);
    });

    it('debe lanzar NotFoundException si la categoria no existe', async () => {
      mockCategoriaRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          nombre: 'Coca',
          descripcion: 'Gaseosa',
          precio: 100,
          categoriaId: 99,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe devolver todos los productos con sus relaciones', async () => {
      mockProductoRepository.find.mockResolvedValue([producto]);

      const result = await service.findAll();

      expect(mockProductoRepository.find).toHaveBeenCalledWith({
        relations: { categoria: true, imagenes: true },
      });
      expect(result).toEqual([producto]);
    });
  });

  describe('findOne', () => {
    it('debe devolver un producto existente', async () => {
      mockProductoRepository.findOne.mockResolvedValue(producto);

      const result = await service.findOne(1);

      expect(mockProductoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { categoria: true, imagenes: true },
      });
      expect(result).toEqual(producto);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockProductoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar los datos sin categoria', async () => {
      const updated = { ...producto, precio: 120 };
      mockProductoRepository.findOne.mockResolvedValue(producto);
      mockProductoRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { precio: 120 });

      expect(mockProductoRepository.save).toHaveBeenCalledWith({
        ...producto,
        precio: 120,
      });
      expect(result).toEqual(updated);
    });

    it('debe actualizar la categoria', async () => {
      const nuevaCategoria = { id: 2, nombre: 'Snacks', productos: [] };
      mockProductoRepository.findOne.mockResolvedValue(producto);
      mockCategoriaRepository.findOneBy.mockResolvedValue(nuevaCategoria);
      mockProductoRepository.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.update(1, { categoriaId: 2 });

      expect(result.categoria).toEqual(nuevaCategoria);
    });

    it('debe lanzar NotFoundException si la categoria no existe', async () => {
      mockProductoRepository.findOne.mockResolvedValue(producto);
      mockCategoriaRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { categoriaId: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un producto existente', async () => {
      mockProductoRepository.findOne.mockResolvedValue(producto);
      mockProductoRepository.remove.mockResolvedValue(producto);

      await service.remove(1);

      expect(mockProductoRepository.remove).toHaveBeenCalledWith(producto);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockProductoRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
