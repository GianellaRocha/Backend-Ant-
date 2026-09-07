import { IsInt, IsOptional, IsUrl } from 'class-validator';

export class UpdateImagenDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsInt()
  productoId?: number;
}
