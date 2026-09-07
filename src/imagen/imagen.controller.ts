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
import { ImagenService } from './imagen.service';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenService: ImagenService) {}

  @Post()
  create(@Body() createImagenDto: CreateImagenDto) {
    return this.imagenService.create(createImagenDto);
  }

  @Get()
  findAll() {
    return this.imagenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.imagenService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateImagenDto: UpdateImagenDto,
  ) {
    return this.imagenService.update(+id, updateImagenDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.imagenService.remove(+id);
  }
}
