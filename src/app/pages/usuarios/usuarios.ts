import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);

  mensaje = signal('');
  error = signal('');

  editandoId = signal<number | string | null>(null);

  formulario: Usuario = this.crearFormularioVacio();

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {

    this.cargando.set(true);
    this.error.set('');

    this.usuariosService.obtenerUsuarios().subscribe({

      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },

      error: (error) => {
        console.error('Error al cargar usuarios:', error);

        this.error.set(
          'No se pudieron cargar los usuarios. Verifica que json-server esté funcionando.'
        );

        this.cargando.set(false);
      }

    });

  }

  nuevoUsuario(): void {

    this.mensaje.set('');
    this.error.set('');
    this.editandoId.set(null);
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario.set(true);

  }

  editarUsuario(usuario: Usuario): void {

    this.mensaje.set('');
    this.error.set('');

    this.editandoId.set(usuario.id ?? null);

    this.formulario = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol
    };

    this.mostrarFormulario.set(true);

  }

  guardarUsuario(form: NgForm): void {

    this.mensaje.set('');
    this.error.set('');

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const datos: Usuario = {
      nombre: this.formulario.nombre.trim(),
      correo: this.formulario.correo.trim().toLowerCase(),
      password: this.formulario.password?.trim() || undefined,
      rol: this.formulario.rol
    };

    const id = this.editandoId();

    this.guardando.set(true);

    if (id === null) {

      this.usuariosService.agregarUsuario(datos).subscribe({

        next: (usuarioCreado) => {

          this.usuarios.update(
            usuariosActuales => [
              ...usuariosActuales,
              usuarioCreado
            ]
          );

          this.mensaje.set('Usuario registrado correctamente.');
          this.guardando.set(false);
          this.cerrarFormulario(form);

        },

        error: (error) => {

          console.error('Error al registrar usuario:', error);

          this.error.set('No se pudo registrar el usuario.');
          this.guardando.set(false);

        }

      });

      return;
    }

    this.usuariosService.actualizarUsuario(id, datos).subscribe({

      next: (usuarioActualizado) => {

        this.usuarios.update(
          usuariosActuales =>
            usuariosActuales.map(usuario =>
              String(usuario.id) === String(id)
                ? usuarioActualizado
                : usuario
            )
        );

        this.mensaje.set('Usuario actualizado correctamente.');
        this.guardando.set(false);
        this.cerrarFormulario(form);

      },

      error: (error) => {

        console.error('Error al actualizar usuario:', error);

        this.error.set('No se pudo actualizar el usuario.');
        this.guardando.set(false);

      }

    });

  }

  eliminarUsuario(usuario: Usuario): void {

    if (usuario.id === undefined) {
      return;
    }

    if (this.esUsuarioActual(usuario)) {

      this.error.set(
        'No puedes eliminar el usuario con el que has iniciado sesión.'
      );

      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar a ${usuario.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');

    this.usuariosService.eliminarUsuario(usuario.id).subscribe({

      next: () => {

        this.usuarios.update(
          usuariosActuales =>
            usuariosActuales.filter(
              elemento =>
                String(elemento.id) !== String(usuario.id)
            )
        );

        this.mensaje.set('Usuario eliminado correctamente.');

      },

      error: (error) => {

        console.error('Error al eliminar usuario:', error);

        this.error.set('No se pudo eliminar el usuario.');

      }

    });

  }

  cancelarFormulario(form?: NgForm): void {
    this.cerrarFormulario(form);
  }

  esUsuarioActual(usuario: Usuario): boolean {

    const usuarioActual = this.authService.getUsuario();

    return String(usuarioActual?.id) === String(usuario.id);

  }

  private cerrarFormulario(form?: NgForm): void {

    this.editandoId.set(null);
    this.formulario = this.crearFormularioVacio();

    form?.resetForm(this.formulario);

    this.mostrarFormulario.set(false);

  }

  private crearFormularioVacio(): Usuario {

    return {
      nombre: '',
      correo: '',
      password: '',
      rol: 'estudiante'
    };

  }
}