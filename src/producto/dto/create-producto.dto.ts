import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MinLength(1)
  nombre: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  categoriaId: number;
}
