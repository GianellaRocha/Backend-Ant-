import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateFormaDePagoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;
}
