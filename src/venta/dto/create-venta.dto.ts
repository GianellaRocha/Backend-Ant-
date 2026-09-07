import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateDetalleVentaDto } from './create-detalle-venta.dto';

export class CreateVentaDto {
  @IsString()
  @MinLength(1)
  cliente: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @IsInt()
  formaDePagoId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleVentaDto)
  detalles: CreateDetalleVentaDto[];
}
