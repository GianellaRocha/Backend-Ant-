import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  solicitarRecuperacion(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.solicitarRecuperacion(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  restablecerContrasena(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.restablecerContrasena(resetPasswordDto);
  }
}
