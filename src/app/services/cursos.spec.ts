import { TestBed } from '@angular/core/testing';

import { Cursos } from './cursos.service';

describe('Cursos', () => {
  let service: Cursos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cursos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
