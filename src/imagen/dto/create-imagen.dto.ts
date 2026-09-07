import { IsInt, IsUrl } from 'class-validator';

export class CreateImagenDto {
  @IsUrl()
  url: string;

  @IsInt()
  productoId: number;
}
