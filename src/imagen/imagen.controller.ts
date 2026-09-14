import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImagenService } from './imagen.service';
import { CreateImagenDto } from './dto/create-imagen.dto';
import { UpdateImagenDto } from './dto/update-imagen.dto';

const MIMETYPES_IMAGEN = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenService: ImagenService) {}

  @Post()
  create(@Body() createImagenDto: CreateImagenDto) {
    return this.imagenService.create(createImagenDto);
  }

  @Post('upload/:productoId')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  subir(
    @Param('productoId', ParseIntPipe) productoId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Debes enviar la imagen en el campo "file"');
    }
    if (!MIMETYPES_IMAGEN.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de imagen no válido. Usa PNG, JPG, WebP, GIF, SVG o AVIF.',
      );
    }
    return this.imagenService.subirYReemplazar(+productoId, {
      nombre: file.originalname,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });
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
