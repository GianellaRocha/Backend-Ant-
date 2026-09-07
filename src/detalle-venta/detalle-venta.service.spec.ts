import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DetalleVentaService } from './detalle-venta.service';

describe('DetalleVentaService', () => {
  let service: DetalleVentaService;

  const mockDetalleVentaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductoRepository = {
    findOneBy: jest.fn(),
  };

  const mockVentaRepository = {
    findOneBy: jest.fn(),
  };

  const producto = { id: 1, nombre: 'Coca', precio: 100, categoria: {} };
  const venta = { id: 1, cliente: 'Juan', total: 200 };
  const detalleVenta = { id: 1, cantidad: 2, producto, venta };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DetalleVentaService,
        {
          provide: 'DetalleVentaRepository',
          useValue: mockDetalleVentaRepository,
        },
        { provide: 'ProductoRepository', useValue: mockProductoRepository },
        { provide: 'VentaRepository', useValue: mockVentaRepository },
      ],
    }).compile();

    service = module.get<DetalleVentaService>(DetalleVentaService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un detalle de venta', async () => {
      const dto = { cantidad: 2, productoId: 1, ventaId: 1 };
      mockProductoRepository.findOneBy.mockResolvedValue(producto);
      mockVentaRepository.findOneBy.mockResolvedValue(venta);
      mockDetalleVentaRepository.create.mockReturnValue(detalleVenta);
      mockDetalleVentaRepository.save.mockResolvedValue(detalleVenta);

      const result = await service.create(dto);

      expect(mockProductoRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockVentaRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockDetalleVentaRepository.create).toHaveBeenCalledWith({
        cantidad: 2,
        producto,
        venta,
      });
      expect(result).toEqual(detalleVenta);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ cantidad: 2, productoId: 99, ventaId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si la venta no existe', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(producto);
      mockVentaRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ cantidad: 2, productoId: 1, ventaId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe devolver todos los detalles con sus relaciones', async () => {
      mockDetalleVentaRepository.find.mockResolvedValue([detalleVenta]);

      const result = await service.findAll();

      expect(mockDetalleVentaRepository.find).toHaveBeenCalledWith({
        relations: { producto: true, venta: true },
      });
      expect(result).toEqual([detalleVenta]);
    });
  });

  describe('findOne', () => {
    it('debe devolver un detalle existente', async () => {
      mockDetalleVentaRepository.findOne.mockResolvedValue(detalleVenta);

      const result = await service.findOne(1);

      expect(mockDetalleVentaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { producto: true, venta: true },
      });
      expect(result).toEqual(detalleVenta);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockDetalleVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar la cantidad', async () => {
      mockDetalleVentaRepository.findOne.mockResolvedValue(detalleVenta);
      mockDetalleVentaRepository.save.mockImplementation((d) =>
        Promise.resolve(d),
      );

      const result = await service.update(1, { cantidad: 3 });

      expect(result.cantidad).toBe(3);
    });

    it('debe actualizar el producto', async () => {
      const nuevoProducto = {
        id: 2,
        nombre: 'Papas',
        precio: 250,
        categoria: {},
      };
      mockDetalleVentaRepository.findOne.mockResolvedValue(detalleVenta);
      mockProductoRepository.findOneBy.mockResolvedValue(nuevoProducto);
      mockDetalleVentaRepository.save.mockImplementation((d) =>
        Promise.resolve(d),
      );

      const result = await service.update(1, { productoId: 2 });

      expect(result.producto).toEqual(nuevoProducto);
    });

    it('debe actualizar la venta', async () => {
      const nuevaVenta = { id: 2, cliente: 'Maria', total: 100 };
      mockDetalleVentaRepository.findOne.mockResolvedValue(detalleVenta);
      mockVentaRepository.findOneBy.mockResolvedValue(nuevaVenta);
      mockDetalleVentaRepository.save.mockImplementation((d) =>
        Promise.resolve(d),
      );

      const result = await service.update(1, { ventaId: 2 });

      expect(result.venta).toEqual(nuevaVenta);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockDetalleVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, { cantidad: 3 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un detalle existente', async () => {
      mockDetalleVentaRepository.findOneBy.mockResolvedValue(detalleVenta);
      mockDetalleVentaRepository.remove.mockResolvedValue(detalleVenta);

      await service.remove(1);

      expect(mockDetalleVentaRepository.remove).toHaveBeenCalledWith(
        detalleVenta,
      );
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockDetalleVentaRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
