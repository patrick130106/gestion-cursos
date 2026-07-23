import { Component } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  usuario: any;

  constructor(
    private authService: AuthService
  ) {
    this.usuario = this.authService.getUsuario();
  }

  esAdmin(): boolean {
    return this.usuario?.rol === 'admin';
  }

  esProfesor(): boolean {
    return this.usuario?.rol === 'profesor';
  }

  esEstudiante(): boolean {
    return this.usuario?.rol === 'estudiante';
  }
}