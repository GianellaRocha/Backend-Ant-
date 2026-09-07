import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { FormaDePagoService } from './forma-de-pago.service';
import { CreateFormaDePagoDto } from './dto/create-forma-de-pago.dto';
import { UpdateFormaDePagoDto } from './dto/update-forma-de-pago.dto';

@Controller('formas-de-pago')
export class FormasDePagoController {
  constructor(private readonly formaDePagoService: FormaDePagoService) {}

  @Post()
  create(@Body() createFormaDePagoDto: CreateFormaDePagoDto) {
    return this.formaDePagoService.create(createFormaDePagoDto);
  }

  @Get()
  findAll() {
    return this.formaDePagoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.formaDePagoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateFormaDePagoDto: UpdateFormaDePagoDto,
  ) {
    return this.formaDePagoService.update(+id, updateFormaDePagoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.formaDePagoService.remove(+id);
  }
}
