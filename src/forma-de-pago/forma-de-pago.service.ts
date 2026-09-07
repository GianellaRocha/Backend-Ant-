import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormaDePago } from './entities/forma-de-pago.entity';
import { CreateFormaDePagoDto } from './dto/create-forma-de-pago.dto';
import { UpdateFormaDePagoDto } from './dto/update-forma-de-pago.dto';

@Injectable()
export class FormaDePagoService {
  constructor(
    @InjectRepository(FormaDePago)
    private readonly formaDePagoRepository: Repository<FormaDePago>,
  ) {}

  create(createFormaDePagoDto: CreateFormaDePagoDto): Promise<FormaDePago> {
    const formaDePago = this.formaDePagoRepository.create(createFormaDePagoDto);
    return this.formaDePagoRepository.save(formaDePago);
  }

  findAll(): Promise<FormaDePago[]> {
    return this.formaDePagoRepository.find({ relations: { ventas: true } });
  }

  async findOne(id: number): Promise<FormaDePago> {
    const formaDePago = await this.formaDePagoRepository.findOne({
      where: { id },
      relations: { ventas: true },
    });
    if (!formaDePago) {
      throw new NotFoundException(`Forma de pago con id ${id} no encontrada`);
    }
    return formaDePago;
  }

  async update(
    id: number,
    updateFormaDePagoDto: UpdateFormaDePagoDto,
  ): Promise<FormaDePago> {
    const formaDePago = await this.findOne(id);
    Object.assign(formaDePago, updateFormaDePagoDto);
    return this.formaDePagoRepository.save(formaDePago);
  }

  async remove(id: number): Promise<void> {
    const formaDePago = await this.findOne(id);
    await this.formaDePagoRepository.remove(formaDePago);
  }
}
