import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('MAIL_PORT', 587),
      secure: this.config.get<boolean>('MAIL_SECURE', false),
      auth: {
        user: this.config.get<string>('MAIL_USER', ''),
        pass: this.config.get<string>('MAIL_PASS', ''),
      },
    });
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'Frontend Admin <no-reply@antu.com>',
    );
  }

  async enviarCorreo(
    destinatario: string,
    asunto: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: destinatario,
        subject: asunto,
        html,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo a ${destinatario}: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async enviarRecuperacionContrasena(
    destinatario: string,
    enlace: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4ecdc; padding:24px; border-radius:10px;">
        <h2 style="color:#4f494c;">Recuperación de contraseña</h2>
        <p style="color:#4f494c;">
          Recibimos una solicitud para restablecer tu contraseña.
          Haz clic en el botón para crear una nueva contraseña:
        </p>
        <p style="text-align:center;">
          <a href="${enlace}" style="background:#bd866a; color:#f4ecdc; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#89685f; font-size:13px;">
          Si no solicitaste esto, ignora este correo. El enlace expira en 1 hora.
        </p>
      </div>
    `;

    await this.enviarCorreo(destinatario, 'Recuperación de contraseña', html);
  }
}
