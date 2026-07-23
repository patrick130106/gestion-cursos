export type RolUsuario = 'admin' | 'profesor' | 'estudiante';

export interface Usuario {
  id?: number | string;
  nombre: string;
  correo: string;
  password?: string;
  rol: RolUsuario;
}