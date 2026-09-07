import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PayloadJwt } from '../jwt-payload.interface';

type RequestConUsuario = Request & { user: PayloadJwt };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PayloadJwt =>
    ctx.switchToHttp().getRequest<RequestConUsuario>().user,
);
