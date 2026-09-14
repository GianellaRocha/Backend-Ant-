import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const ORIGENES_FIJOS = ['http://localhost:5173', 'http://localhost:5174'];

function esOrigenPermitido(origin: string): boolean {
  return (
    ORIGENES_FIJOS.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    (process.env.ADMIN_FRONTEND_URL ?? '').split(',').includes(origin) ||
    (process.env.CATALOGO_FRONTEND_URL ?? '').split(',').includes(origin)
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || esOrigenPermitido(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
