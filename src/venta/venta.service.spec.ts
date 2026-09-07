import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VentaService } from './venta.service';

describe('VentaService', () => {
  let service: VentaService;

  const mockVentaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockDetalleVentaRepository = {
    create: jest.fn(),
  };

  const mockProductoRepository = {
    findOneBy: jest.fn(),
  };

  const mockFormaDePagoRepository = {
    findOneBy: jest.fn(),
  };

  const formaDePago = { id: 1, nombre: 'Efectivo', ventas: [] };
  const coca = {
    id: 1,
    nombre: 'Coca',
    descripcion: 'Gaseosa',
    precio: 100,
    categoria: {},
  };
  const papas = {
    id: 2,
    nombre: 'Papas',
    descripcion: 'Snack',
    precio: 250,
    categoria: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentaService,
        { provide: 'VentaRepository', useValue: mockVentaRepository },
        {
          provide: 'DetalleVentaRepository',
          useValue: mockDetalleVentaRepository,
        },
        { provide: 'ProductoRepository', useValue: mockProductoRepository },
        {
          provide: 'FormaDePagoRepository',
          useValue: mockFormaDePagoRepository,
        },
      ],
    }).compile();

    service = module.get<VentaService>(VentaService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear la venta, sus detalles y calcular el total', async () => {
      const dto = {
        cliente: 'Juan',
        formaDePagoId: 1,
        detalles: [
          { productoId: 1, cantidad: 2 },
          { productoId: 2, cantidad: 1 },
        ],
      };

      mockFormaDePagoRepository.findOneBy.mockResolvedValue(formaDePago);
      mockProductoRepository.findOneBy.mockImplementation(
        ({ id }: { id: number }) => (id === 1 ? coca : papas),
      );
      mockDetalleVentaRepository.create.mockImplementation(
        (d: { cantidad: number }) => d,
      );
      mockVentaRepository.create.mockImplementation((d: unknown) => d);
      mockVentaRepository.save.mockResolvedValue({
        id: 1,
        ...dto,
        fecha: new Date(),
        total: 450,
        formaDePago,
        detalles: [
          { cantidad: 2, producto: coca },
          { cantidad: 1, producto: papas },
        ],
      });

      const result = await service.create(dto);

      expect(mockFormaDePagoRepository.findOneBy).toHaveBeenCalledWith({
        id: 1,
      });
      expect(mockProductoRepository.findOneBy).toHaveBeenCalledTimes(2);
      expect(mockVentaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ total: 450 }),
      );
      expect(mockVentaRepository.save).toHaveBeenCalled();
      expect(result.total).toBe(450);
      expect(result.detalles).toHaveLength(2);
    });

    it('debe usar la fecha recibida si se provee', async () => {
      const fecha = new Date('2026-01-01T00:00:00Z');
      const dto = {
        cliente: 'Juan',
        fecha,
        formaDePagoId: 1,
        detalles: [{ productoId: 1, cantidad: 1 }],
      };

      mockFormaDePagoRepository.findOneBy.mockResolvedValue(formaDePago);
      mockProductoRepository.findOneBy.mockResolvedValue(coca);
      mockDetalleVentaRepository.create.mockImplementation((d) => d);
      mockVentaRepository.create.mockImplementation((d) => d);
      mockVentaRepository.save.mockResolvedValue({ id: 1, ...dto, total: 100 });

      const result = await service.create(dto);

      expect(mockVentaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ fecha }),
      );
      expect(result.fecha).toEqual(fecha);
    });

    it('debe lanzar NotFoundException si la forma de pago no existe', async () => {
      mockFormaDePagoRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          cliente: 'Juan',
          formaDePagoId: 99,
          detalles: [{ productoId: 1, cantidad: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockProductoRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si un producto no existe', async () => {
      mockFormaDePagoRepository.findOneBy.mockResolvedValue(formaDePago);
      mockProductoRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          cliente: 'Juan',
          formaDePagoId: 1,
          detalles: [{ productoId: 99, cantidad: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('debe devolver todas las ventas con sus relaciones', async () => {
      const venta = { id: 1, cliente: 'Juan', total: 450 };
      mockVentaRepository.find.mockResolvedValue([venta]);

      const result = await service.findAll();

      expect(mockVentaRepository.find).toHaveBeenCalledWith({
        relations: { detalles: { producto: true }, formaDePago: true },
      });
      expect(result).toEqual([venta]);
    });
  });

  describe('findOne', () => {
    it('debe devolver una venta existente', async () => {
      const venta = { id: 1, cliente: 'Juan', total: 450 };
      mockVentaRepository.findOne.mockResolvedValue(venta);

      const result = await service.findOne(1);

      expect(mockVentaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { detalles: { producto: true }, formaDePago: true },
      });
      expect(result).toEqual(venta);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar datos basicos de la venta', async () => {
      const venta = {
        id: 1,
        cliente: 'Juan',
        total: 450,
        formaDePago,
        detalles: [],
      };
      mockVentaRepository.findOne.mockResolvedValue(venta);
      mockVentaRepository.save.mockImplementation((v) => Promise.resolve(v));

      const result = await service.update(1, { cliente: 'Maria' });

      expect(result.cliente).toBe('Maria');
      expect(mockFormaDePagoRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('debe actualizar la forma de pago', async () => {
      const venta = {
        id: 1,
        cliente: 'Juan',
        total: 450,
        formaDePago,
        detalles: [],
      };
      const nuevaForma = { id: 2, nombre: 'Tarjeta', ventas: [] };
      mockVentaRepository.findOne.mockResolvedValue(venta);
      mockFormaDePagoRepository.findOneBy.mockResolvedValue(nuevaForma);
      mockVentaRepository.save.mockImplementation((v) => Promise.resolve(v));

      const result = await service.update(1, { formaDePagoId: 2 });

      expect(result.formaDePago).toEqual(nuevaForma);
    });

    it('debe lanzar NotFoundException si la forma de pago no existe', async () => {
      mockVentaRepository.findOne.mockResolvedValue({ id: 1 });
      mockFormaDePagoRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(1, { formaDePagoId: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una venta existente con sus detalles', async () => {
      const venta = { id: 1, cliente: 'Juan', detalles: [] };
      mockVentaRepository.findOne.mockResolvedValue(venta);
      mockVentaRepository.remove.mockResolvedValue(venta);

      await service.remove(1);

      expect(mockVentaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { detalles: true },
      });
      expect(mockVentaRepository.remove).toHaveBeenCalledWith(venta);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockVentaRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
