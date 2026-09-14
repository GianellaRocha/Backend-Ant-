import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsInt()
  categoriaPadreId?: number;
}