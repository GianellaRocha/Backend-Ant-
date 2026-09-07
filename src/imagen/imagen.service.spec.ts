import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ImagenService } from './imagen.service';

describe('ImagenService', () => {
  let service: ImagenService;

  const mockImagenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductoRepository = {
    findOneBy: jest.fn(),
  };

  const producto = { id: 1, nombre: 'Coca', detalleVentas: [], categoria: {} };
  const imagen = { id: 1, url: 'http://img.com/1.jpg', producto };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagenService,
        {
          provide: 'ImagenRepository',
          useValue: mockImagenRepository,
        },
        {
          provide: 'ProductoRepository',
          useValue: mockProductoRepository,
        },
      ],
    }).compile();

    service = module.get<ImagenService>(ImagenService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una imagen asociada a un producto', async () => {
      const dto = { url: 'http://img.com/1.jpg', productoId: 1 };
      mockProductoRepository.findOneBy.mockResolvedValue(producto);
      mockImagenRepository.create.mockReturnValue(imagen);
      mockImagenRepository.save.mockResolvedValue(imagen);

      const result = await service.create(dto);

      expect(mockProductoRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockImagenRepository.create).toHaveBeenCalledWith({
        url: dto.url,
        producto,
      });
      expect(result).toEqual(imagen);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ url: 'http://img.com/1.jpg', productoId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe devolver todas las imagenes con su producto', async () => {
      mockImagenRepository.find.mockResolvedValue([imagen]);

      const result = await service.findAll();

      expect(mockImagenRepository.find).toHaveBeenCalledWith({
        relations: { producto: true },
      });
      expect(result).toEqual([imagen]);
    });
  });

  describe('findOne', () => {
    it('debe devolver una imagen existente', async () => {
      mockImagenRepository.findOne.mockResolvedValue(imagen);

      const result = await service.findOne(1);

      expect(mockImagenRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { producto: true },
      });
      expect(result).toEqual(imagen);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockImagenRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una imagen', async () => {
      const dto = { url: 'http://img.com/2.jpg' };
      const updated = { ...imagen, ...dto };
      mockImagenRepository.findOne.mockResolvedValue(imagen);
      mockImagenRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(mockImagenRepository.save).toHaveBeenCalledWith({
        ...imagen,
        ...dto,
      });
      expect(result).toEqual(updated);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockImagenRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(99, { url: 'http://img.com/2.jpg' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una imagen existente', async () => {
      mockImagenRepository.findOne.mockResolvedValue(imagen);
      mockImagenRepository.remove.mockResolvedValue(imagen);

      await service.remove(1);

      expect(mockImagenRepository.remove).toHaveBeenCalledWith(imagen);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockImagenRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
