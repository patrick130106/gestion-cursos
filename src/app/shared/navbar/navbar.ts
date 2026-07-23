import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  usuario: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.getUsuario();
  }

  cerrarSesion(): void {

    this.authService.logout();

    this.router.navigate(['/login']);

  }
}