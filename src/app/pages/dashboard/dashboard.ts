import { Component } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

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
}