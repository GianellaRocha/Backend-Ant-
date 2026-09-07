import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Venta } from '../venta/entities/venta.entity';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

@Injectable()
export class DetalleVentaService {
  constructor(
    @InjectRepository(DetalleVenta)
    private readonly detalleVentaRepository: Repository<DetalleVenta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  async create(
    createDetalleVentaDto: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const { productoId, ventaId, ...data } = createDetalleVentaDto;

    const producto = await this.productoRepository.findOneBy({
      id: productoId,
    });
    if (!producto) {
      throw new NotFoundException(
        `Producto con id ${productoId} no encontrado`,
      );
    }

    const venta = await this.ventaRepository.findOneBy({ id: ventaId });
    if (!venta) {
      throw new NotFoundException(`Venta con id ${ventaId} no encontrada`);
    }

    const detalleVenta = this.detalleVentaRepository.create({
      ...data,
      producto,
      venta,
    });
    return this.detalleVentaRepository.save(detalleVenta);
  }

  findAll(): Promise<DetalleVenta[]> {
    return this.detalleVentaRepository.find({
      relations: { producto: true, venta: true },
    });
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.detalleVentaRepository.findOne({
      where: { id },
      relations: { producto: true, venta: true },
    });
    if (!detalleVenta) {
      throw new NotFoundException(
        `Detalle de venta con id ${id} no encontrado`,
      );
    }
    return detalleVenta;
  }

  async update(
    id: number,
    updateDetalleVentaDto: UpdateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    const { productoId, ventaId, ...data } = updateDetalleVentaDto;

    if (productoId !== undefined) {
      const producto = await this.productoRepository.findOneBy({
        id: productoId,
      });
      if (!producto) {
        throw new NotFoundException(
          `Producto con id ${productoId} no encontrado`,
        );
      }
      detalleVenta.producto = producto;
    }

    if (ventaId !== undefined) {
      const venta = await this.ventaRepository.findOneBy({ id: ventaId });
      if (!venta) {
        throw new NotFoundException(`Venta con id ${ventaId} no encontrada`);
      }
      detalleVenta.venta = venta;
    }

    Object.assign(detalleVenta, data);
    return this.detalleVentaRepository.save(detalleVenta);
  }

  async remove(id: number): Promise<void> {
    const detalleVenta = await this.detalleVentaRepository.findOneBy({ id });
    if (!detalleVenta) {
      throw new NotFoundException(
        `Detalle de venta con id ${id} no encontrado`,
      );
    }
    await this.detalleVentaRepository.remove(detalleVenta);
  }
}
