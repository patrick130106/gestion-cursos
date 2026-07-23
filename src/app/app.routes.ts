import { Routes } from '@angular/router';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [

  {
    path: 'login',

    loadComponent: () =>
      import('./pages/login/login')
        .then(modulo => modulo.Login)
  },

  {
    path: '',

    loadComponent: () =>
      import('./shared/layout/layout')
        .then(modulo => modulo.Layout),

    canActivate: [authGuard],

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',

        loadComponent: () =>
          import('./pages/dashboard/dashboard')
            .then(modulo => modulo.Dashboard)
      },

      {
        path: 'usuarios',

        loadComponent: () =>
          import('./pages/usuarios/usuarios')
            .then(modulo => modulo.Usuarios),

        canActivate: [
          roleGuard
        ],

        data: {
          roles: ['admin']
        }
      },

      {
        path: 'cursos',

        loadComponent: () =>
          import('./pages/cursos/cursos')
            .then(modulo => modulo.Cursos),

        canActivate: [
          roleGuard
        ],

        data: {
          roles: [
            'admin',
            'profesor',
            'estudiante'
          ]
        }
      },

      {
        path: '**',

        loadComponent: () =>
          import('./shared/not-found/not-found')
            .then(modulo => modulo.NotFound)
      }

    ]
  }

];