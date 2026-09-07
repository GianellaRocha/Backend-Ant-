import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from '../detalle-venta/entities/detalle-venta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { FormaDePago } from '../forma-de-pago/entities/forma-de-pago.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(FormaDePago)
    private readonly formaDePagoRepository: Repository<FormaDePago>,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const { cliente, fecha, formaDePagoId, detalles } = createVentaDto;

    const formaDePago = await this.formaDePagoRepository.findOneBy({
      id: formaDePagoId,
    });
    if (!formaDePago) {
      throw new NotFoundException(
        `Forma de pago con id ${formaDePagoId} no encontrada`,
      );
    }

    const detallesVenta: DetalleVenta[] = [];
    let total = 0;

    for (const detalle of detalles) {
      const producto = await this.productoRepository.findOneBy({
        id: detalle.productoId,
      });
      if (!producto) {
        throw new NotFoundException(
          `Producto con id ${detalle.productoId} no encontrado`,
        );
      }

      total += producto.precio * detalle.cantidad;
      detallesVenta.push(
        this.detalleVentaRepository.create({
          cantidad: detalle.cantidad,
          producto,
        }),
      );
    }

    const venta = this.ventaRepository.create({
      cliente,
      fecha: fecha ?? new Date(),
      total,
      formaDePago,
      detalles: detallesVenta,
    });

    return this.ventaRepository.save(venta);
  }

  findAll(): Promise<Venta[]> {
    return this.ventaRepository.find({
      relations: { detalles: { producto: true }, formaDePago: true },
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: { detalles: { producto: true }, formaDePago: true },
    });
    if (!venta) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }
    return venta;
  }

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.findOne(id);
    const { formaDePagoId, ...data } = updateVentaDto;

    if (formaDePagoId !== undefined) {
      const formaDePago = await this.formaDePagoRepository.findOneBy({
        id: formaDePagoId,
      });
      if (!formaDePago) {
        throw new NotFoundException(
          `Forma de pago con id ${formaDePagoId} no encontrada`,
        );
      }
      venta.formaDePago = formaDePago;
    }

    Object.assign(venta, data);
    return this.ventaRepository.save(venta);
  }

  async remove(id: number): Promise<void> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: { detalles: true },
    });
    if (!venta) {
      throw new NotFoundException(`Venta con id ${id} no encontrada`);
    }
    await this.ventaRepository.remove(venta);
  }
}
