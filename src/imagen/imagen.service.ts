import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Imagen } from './entities/imagen.entity';
import { Producto } from '../producto/entities/producto.entity';
import {
  StorageService,
  type ArchivoSubido,
} from '../storage/storage.service';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';

@Injectable()
export class ImagenService {
  constructor(
    @InjectRepository(Imagen)
    private readonly imagenRepository: Repository<Imagen>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly storageService: StorageService,
  ) {}

  async create(createImagenDto: CreateImagenDto): Promise<Imagen> {
    const { productoId, ...data } = createImagenDto;

    const producto = await this.productoRepository.findOneBy({
      id: productoId,
    });
    if (!producto) {
      throw new NotFoundException(
        `Producto con id ${productoId} no encontrado`,
      );
    }

    const imagen = this.imagenRepository.create({ ...data, producto });
    return this.imagenRepository.save(imagen);
  }

  findAll(): Promise<Imagen[]> {
    return this.imagenRepository.find({ relations: { producto: true } });
  }

  async findOne(id: number): Promise<Imagen> {
    const imagen = await this.imagenRepository.findOne({
      where: { id },
      relations: { producto: true },
    });
    if (!imagen) {
      throw new NotFoundException(`Imagen con id ${id} no encontrada`);
    }
    return imagen;
  }

  async update(id: number, updateImagenDto: UpdateImagenDto): Promise<Imagen> {
    const imagen = await this.findOne(id);
    const { productoId, ...data } = updateImagenDto;

    if (productoId !== undefined) {
      const producto = await this.productoRepository.findOneBy({
        id: productoId,
      });
      if (!producto) {
        throw new NotFoundException(
          `Producto con id ${productoId} no encontrado`,
        );
      }
      imagen.producto = producto;
    }

    Object.assign(imagen, data);
    return this.imagenRepository.save(imagen);
  }

  async remove(id: number): Promise<void> {
    const imagen = await this.findOne(id);
    if (imagen.url) {
      await this.storageService.eliminarArchivo(imagen.url);
    }
    await this.imagenRepository.remove(imagen);
  }

  async subirYReemplazar(
    productoId: number,
    archivo: ArchivoSubido,
  ): Promise<Imagen> {
    const producto = await this.productoRepository.findOneBy({
      id: productoId,
    });
    if (!producto) {
      throw new NotFoundException(
        `Producto con id ${productoId} no encontrado`,
      );
    }

    if (!archivo.buffer || archivo.buffer.length === 0) {
      throw new BadRequestException('El archivo de imagen viene vacío');
    }

    const existentes = await this.imagenRepository.find({
      where: { producto: { id: productoId } },
    });

    for (const imagen of existentes) {
      if (imagen.url) {
        await this.storageService.eliminarArchivo(imagen.url);
      }
      await this.imagenRepository.remove(imagen);
    }

    const url = await this.storageService.subirArchivo(archivo);
    const imagen = this.imagenRepository.create({ url, producto });
    return this.imagenRepository.save(imagen);
  }
}
