import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormaDePagoService } from './forma-de-pago.service';
import { FormasDePagoController } from './forma-de-pago.controller';
import { FormaDePago } from './entities/forma-de-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FormaDePago])],
  controllers: [FormasDePagoController],
  providers: [FormaDePagoService],
})
export class FormaDePagoModule {}
