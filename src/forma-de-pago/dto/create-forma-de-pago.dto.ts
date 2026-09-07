import { IsString, MinLength } from 'class-validator';

export class CreateFormaDePagoDto {
  @IsString()
  @MinLength(1)
  nombre: string;
}
