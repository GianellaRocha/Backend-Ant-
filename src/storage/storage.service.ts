import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ArchivoSubido {
  nombre: string;
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class StorageService {
  private readonly supabaseUrl: string;
  private readonly accessKey: string;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.supabaseUrl = (this.config.get<string>('SUPABASE_URL') ?? '').replace(
      /\/$/,
      '',
    );
    this.accessKey = this.config.get<string>('SUPABASE_STORAGE_ACCESS_KEY') ?? '';
    this.bucket = this.config.get<string>('SUPABASE_STORAGE_BUCKET', 'productos');
  }

  private get configurado(): boolean {
    return Boolean(this.supabaseUrl && this.accessKey);
  }

  async subirArchivo(archivo: ArchivoSubido): Promise<string> {
    if (!this.configurado) {
      throw new InternalServerErrorException(
        'Supabase Storage no está configurado en el backend',
      );
    }

    const ruta = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${this.extensionDe(
      archivo.mimetype,
    )}`;

    const respuesta = await fetch(
      `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${ruta}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessKey}`,
          'Content-Type': archivo.mimetype,
          'x-upsert': 'true',
        },
        body: archivo.buffer as unknown as BodyInit,
      },
    );

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new InternalServerErrorException(
        `No se pudo subir la imagen a Supabase: ${respuesta.status} ${detalle}`,
      );
    }

    return this.urlPublica(ruta);
  }

  async eliminarArchivo(url: string): Promise<void> {
    if (!this.configurado) return;

    const ruta = this.rutaDesdeUrl(url);
    if (!ruta) return;

    await fetch(
      `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${ruta}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessKey}`,
        },
      },
    );
  }

  private urlPublica(ruta: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${ruta}`;
  }

  private rutaDesdeUrl(url: string): string | null {
    const prefijo = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/`;
    if (url.startsWith(prefijo)) {
      return decodeURIComponent(url.slice(prefijo.length));
    }
    return null;
  }

  private extensionDe(mimetype: string): string {
    const mapas: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/avif': 'avif',
    };
    return mapas[mimetype] ?? 'bin';
  }
}