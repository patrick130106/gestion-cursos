import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { CursosService } from '../../services/cursos.service';
import { Curso } from '../../models/curso';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css'
})
export class Cursos implements OnInit {

  cursos = signal<Curso[]>([]);

  cargando = signal(true);
  guardando = signal(false);
  mostrarFormulario = signal(false);

  mensaje = signal('');
  error = signal('');

  editandoId = signal<number | string | null>(null);

  formulario: Curso = this.crearFormularioVacio();

  usuario: any;

constructor(
  private cursosService: CursosService,
  private authService: AuthService
) {
  this.usuario = this.authService.getUsuario();
}
puedeCrear(): boolean {
  return (
    this.usuario?.rol === 'admin' ||
    this.usuario?.rol === 'profesor'
  );
}

puedeEditar(curso: Curso): boolean {

  if (this.usuario?.rol === 'admin') {
    return true;
  }

  if (this.usuario?.rol === 'profesor') {
    return (
      String(curso.creadoPor) ===
      String(this.usuario.id)
    );
  }

  return false;
}

puedeEliminar(): boolean {
  return this.usuario?.rol === 'admin';
}

  ngOnInit(): void {
    this.cargarCursos();
  }

  cargarCursos(): void {

    this.cargando.set(true);
    this.error.set('');

    this.cursosService.obtenerCursos().subscribe({

      next: (data) => {

        this.cursos.set(data);
        this.cargando.set(false);

      },

      error: (error) => {

        console.error('Error al cargar cursos:', error);

        this.error.set(
          'No se pudieron cargar los cursos. Verifica que json-server esté funcionando.'
        );

        this.cargando.set(false);

      }

    });

  }

  nuevoCurso(): void {

    this.mensaje.set('');
    this.error.set('');

    this.editandoId.set(null);
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario.set(true);

  }

  editarCurso(curso: Curso): void {

    this.mensaje.set('');
    this.error.set('');

    this.editandoId.set(curso.id ?? null);

    this.formulario = {
      nombre: curso.nombre,
      descripcion: curso.descripcion
    };

    this.mostrarFormulario.set(true);

  }

  guardarCurso(form: NgForm): void {

    this.mensaje.set('');
    this.error.set('');

    if (form.invalid) {

      form.control.markAllAsTouched();
      return;

    }

    const datos: Curso = {
      nombre: this.formulario.nombre.trim(),
      descripcion: this.formulario.descripcion.trim()
    };

    const id = this.editandoId();

    this.guardando.set(true);

    if (id === null) {

      this.cursosService.agregarCurso(datos).subscribe({

        next: (cursoCreado) => {

          this.cursos.update(
            cursosActuales => [
              ...cursosActuales,
              cursoCreado
            ]
          );

          this.mensaje.set(
            'Curso registrado correctamente.'
          );

          this.guardando.set(false);
          this.cerrarFormulario(form);

        },

        error: (error) => {

          console.error(
            'Error al registrar curso:',
            error
          );

          this.error.set(
            'No se pudo registrar el curso.'
          );

          this.guardando.set(false);

        }

      });

      return;

    }

    this.cursosService
      .actualizarCurso(id, datos)
      .subscribe({

        next: (cursoActualizado) => {

          this.cursos.update(
            cursosActuales =>
              cursosActuales.map(curso =>
                String(curso.id) === String(id)
                  ? cursoActualizado
                  : curso
              )
          );

          this.mensaje.set(
            'Curso actualizado correctamente.'
          );

          this.guardando.set(false);
          this.cerrarFormulario(form);

        },

        error: (error) => {

          console.error(
            'Error al actualizar curso:',
            error
          );

          this.error.set(
            'No se pudo actualizar el curso.'
          );

          this.guardando.set(false);

        }

      });

  }

  eliminarCurso(curso: Curso): void {

    if (curso.id === undefined) {
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el curso "${curso.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');

    this.cursosService
      .eliminarCurso(curso.id)
      .subscribe({

        next: () => {

          this.cursos.update(
            cursosActuales =>
              cursosActuales.filter(
                elemento =>
                  String(elemento.id) !==
                  String(curso.id)
              )
          );

          this.mensaje.set(
            'Curso eliminado correctamente.'
          );

        },

        error: (error) => {

          console.error(
            'Error al eliminar curso:',
            error
          );

          this.error.set(
            'No se pudo eliminar el curso.'
          );

        }

      });

  }

  cancelarFormulario(form?: NgForm): void {
    this.cerrarFormulario(form);
  }

  private cerrarFormulario(form?: NgForm): void {

    this.editandoId.set(null);
    this.formulario = this.crearFormularioVacio();

    form?.resetForm(this.formulario);

    this.mostrarFormulario.set(false);

  }

  private crearFormularioVacio(): Curso {

    return {
      nombre: '',
      descripcion: ''
    };

  }
}