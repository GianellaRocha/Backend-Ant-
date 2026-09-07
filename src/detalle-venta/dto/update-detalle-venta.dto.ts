import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateDetalleVentaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidad?: number;

  @IsOptional()
  @IsInt()
  productoId?: number;

  @IsOptional()
  @IsInt()
  ventaId?: number;
}
