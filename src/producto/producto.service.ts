import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { categoriaId, ...data } = createProductoDto;

    const categoria = await this.categoriaRepository.findOneBy({
      id: categoriaId,
    });
    if (!categoria) {
      throw new NotFoundException(
        `Categoria con id ${categoriaId} no encontrada`,
      );
    }

    const producto = this.productoRepository.create({ ...data, categoria });
    return this.productoRepository.save(producto);
  }

  findAll(): Promise<Producto[]> {
    return this.productoRepository.find({
      relations: { categoria: true, imagenes: true },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: { categoria: true, imagenes: true },
    });
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);
    const { categoriaId, ...data } = updateProductoDto;

    if (categoriaId !== undefined) {
      const categoria = await this.categoriaRepository.findOneBy({
        id: categoriaId,
      });
      if (!categoria) {
        throw new NotFoundException(
          `Categoria con id ${categoriaId} no encontrada`,
        );
      }
      producto.categoria = categoria;
    }

    Object.assign(producto, data);
    return this.productoRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productoRepository.remove(producto);
  }
}
