import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;

  usuario: {
    id: number | string;
    nombre: string;
    correo: string;
    rol: 'admin' | 'profesor' | 'estudiante';
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl =
    'http://localhost:3000';

  constructor(
    private http: HttpClient
  ) {}

  login(
    correo: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/login`,
        {
          correo: correo.trim().toLowerCase(),
          password
        }
      )
      .pipe(
        tap(response => {
          localStorage.setItem(
            'token',
            response.token
          );

          localStorage.setItem(
            'usuario',
            JSON.stringify(response.usuario)
          );
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): any {
    const usuario =
      localStorage.getItem('usuario');

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario);
    } catch {
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    try {
      const partes = token.split('.');

      if (partes.length !== 3) {
        this.logout();
        return false;
      }

      const payloadBase64 = partes[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padding =
        '='.repeat(
          (4 - payloadBase64.length % 4) % 4
        );

      const payload = JSON.parse(
        atob(payloadBase64 + padding)
      );

      const expirado =
        typeof payload.exp !== 'number' ||
        payload.exp * 1000 <= Date.now();

      if (expirado) {
        this.logout();
        return false;
      }

      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}