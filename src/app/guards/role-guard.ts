import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuario();

  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  const rolesPermitidos = route.data['roles'] as string[];

  if (rolesPermitidos.includes(usuario.rol)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;

};