import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const { categoriaPadreId, ...data } = createCategoriaDto;

    const categoria = this.categoriaRepository.create(data);

    if (categoriaPadreId !== undefined) {
      categoria.padre = await this.cargarPadre(categoriaPadreId);
    }

    return this.categoriaRepository.save(categoria);
  }

  findAll(): Promise<Categoria[]> {
    return this.categoriaRepository.find({
      where: { padre: IsNull() },
      order: { id: 'ASC' },
      relations: {
        hijos: { productos: true },
        productos: true,
      },
    });
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: {
        hijos: { productos: true },
        productos: true,
      },
    });
    if (!categoria) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    }
    return categoria;
  }

  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.findOne(id);
    const { categoriaPadreId, ...data } = updateCategoriaDto;

    Object.assign(categoria, data);

    if (categoriaPadreId !== undefined) {
      categoria.padre = await this.cargarPadre(categoriaPadreId);
    } else if ('categoriaPadreId' in updateCategoriaDto) {
      categoria.padre = undefined as Categoria | undefined;
    }

    return this.categoriaRepository.save(categoria);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
  }

  private async cargarPadre(categoriaPadreId: number): Promise<Categoria> {
    const padre = await this.categoriaRepository.findOneBy({
      id: categoriaPadreId,
    });
    if (!padre) {
      throw new NotFoundException(
        `Categoria padre con id ${categoriaPadreId} no encontrada`,
      );
    }
    return padre;
  }
}