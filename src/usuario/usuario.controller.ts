import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from './entities/usuario.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { PayloadJwt } from '../auth/jwt-payload.interface';

@Controller('usuarios')
@Roles(RolUsuario.ADMIN)
export class UsuariosController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get('me')
  findMe(@CurrentUser() usuario: PayloadJwt) {
    return usuario;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.usuarioService.remove(+id);
  }
}
