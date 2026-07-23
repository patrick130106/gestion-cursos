import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Curso } from '../models/curso';

@Injectable({
  providedIn: 'root'
})
export class CursosService {

  private readonly apiUrl = 'http://localhost:3000/cursos';

  constructor(private http: HttpClient) {}

  obtenerCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  obtenerCurso(id: number | string): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  agregarCurso(curso: Curso): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, curso);
  }

  actualizarCurso(
    id: number | string,
    curso: Curso
  ): Observable<Curso> {

    return this.http.put<Curso>(
      `${this.apiUrl}/${id}`,
      curso
    );
  }

  eliminarCurso(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}