import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FormaDePagoService } from './forma-de-pago.service';

describe('FormaDePagoService', () => {
  let service: FormaDePagoService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const formaDePago = { id: 1, nombre: 'Efectivo', ventas: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormaDePagoService,
        {
          provide: 'FormaDePagoRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FormaDePagoService>(FormaDePagoService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una forma de pago', async () => {
      mockRepository.create.mockReturnValue(formaDePago);
      mockRepository.save.mockResolvedValue(formaDePago);

      const result = await service.create({ nombre: 'Efectivo' });

      expect(mockRepository.create).toHaveBeenCalledWith({
        nombre: 'Efectivo',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(formaDePago);
      expect(result).toEqual(formaDePago);
    });
  });

  describe('findAll', () => {
    it('debe devolver todas las formas de pago', async () => {
      mockRepository.find.mockResolvedValue([formaDePago]);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: { ventas: true },
      });
      expect(result).toEqual([formaDePago]);
    });
  });

  describe('findOne', () => {
    it('debe devolver una forma de pago existente', async () => {
      mockRepository.findOne.mockResolvedValue(formaDePago);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { ventas: true },
      });
      expect(result).toEqual(formaDePago);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar una forma de pago existente', async () => {
      const updated = { ...formaDePago, nombre: 'Tarjeta' };
      mockRepository.findOne.mockResolvedValue(formaDePago);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { nombre: 'Tarjeta' });

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...formaDePago,
        nombre: 'Tarjeta',
      });
      expect(result).toEqual(updated);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'Tarjeta' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar una forma de pago existente', async () => {
      mockRepository.findOne.mockResolvedValue(formaDePago);
      mockRepository.remove.mockResolvedValue(formaDePago);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(formaDePago);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
