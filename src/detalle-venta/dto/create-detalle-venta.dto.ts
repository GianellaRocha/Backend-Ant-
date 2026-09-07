import { IsInt, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsInt()
  @Min(1)
  cantidad: number;

  @IsInt()
  productoId: number;

  @IsInt()
  ventaId: number;
}
