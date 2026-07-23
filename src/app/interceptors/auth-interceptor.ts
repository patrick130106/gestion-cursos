import { inject } from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { Router } from '@angular/router';

import {
  catchError,
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  const esPeticionApi =
    req.url.startsWith('http://localhost:3000');

  const esPeticionLogin =
    req.url.endsWith('/login');

  let peticion = req;

  /*
   * Agrega el JWT únicamente a las peticiones
   * protegidas de nuestra API.
   */
  if (
    token &&
    esPeticionApi &&
    !esPeticionLogin
  ) {

    peticion = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  return next(peticion).pipe(

    catchError((error: HttpErrorResponse) => {

      /*
       * Si el servidor devuelve 401 en una ruta
       * protegida, el token expiró o fue manipulado.
       */
      if (
        error.status === 401 &&
        !esPeticionLogin
      ) {

        authService.logout();

        router.navigate(
          ['/login'],
          {
            queryParams: {
              sesion: 'expirada'
            }
          }
        );

      }

      /*
       * Un 403 significa que el usuario está
       * autenticado, pero no tiene permiso.
       * No cerramos su sesión.
       */
      if (error.status === 403) {

        console.warn(
          'Acceso rechazado por falta de permisos.'
        );

      }

      return throwError(() => error);

    })

  );

};