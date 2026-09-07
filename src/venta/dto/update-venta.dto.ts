import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateVentaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  cliente?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsInt()
  formaDePagoId?: number;
}
