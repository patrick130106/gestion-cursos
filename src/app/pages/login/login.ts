import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    const sesion =
      this.route.snapshot.queryParamMap.get('sesion');

    if (sesion === 'expirada') {
      this.error =
        'Tu sesión expiró o el token no es válido. Inicia sesión nuevamente.';
    }

  }

  ingresar(): void {

    this.error = '';

    const correo = this.email.trim().toLowerCase();

    if (!correo || !this.password) {
      this.error =
        'Ingresa tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService
      .login(correo, this.password)
      .subscribe({

        next: () => {

          this.cargando = false;

          this.router.navigate([
            '/dashboard'
          ]);

        },

        error: (error) => {

          console.error(
            'Error al iniciar sesión:',
            error
          );

          this.cargando = false;

          this.error =
            error?.error?.mensaje ||
            'Credenciales incorrectas';

        }

      });

  }

}