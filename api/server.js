const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_PATH = path.join(__dirname, 'db.json');

if (!JWT_SECRET) {
  throw new Error(
    'No se encontró JWT_SECRET. Revisa el archivo api/.env.'
  );
}

/* =========================================================
   MIDDLEWARE GENERAL
========================================================= */

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

/* =========================================================
   FUNCIONES DE BASE DE DATOS
========================================================= */

function leerBaseDatos() {
  try {
    const contenido = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al leer db.json:', error);

    return {
      usuarios: [],
      cursos: []
    };
  }
}

function guardarBaseDatos(datos) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(datos, null, 2),
    'utf8'
  );
}

function generarId(elementos) {
  if (elementos.length === 0) {
    return 1;
  }

  const ids = elementos.map(
    elemento => Number(elemento.id) || 0
  );

  return Math.max(...ids) + 1;
}

function quitarPassword(usuario) {
  const {
    password,
    ...usuarioSeguro
  } = usuario;

  return usuarioSeguro;
}

/* =========================================================
   MIDDLEWARE JWT
========================================================= */

function autenticarToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    return res.status(401).json({
      mensaje: 'Token de autenticación requerido.'
    });
  }

  const token = authorization.substring(7);

  try {
    const payload = jwt.verify(
      token,
      JWT_SECRET
    );

    req.usuario = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado.'
    });
  }
}

function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (
      !req.usuario ||
      !rolesPermitidos.includes(req.usuario.rol)
    ) {
      return res.status(403).json({
        mensaje:
          'No tienes permisos para realizar esta operación.'
      });
    }

    next();
  };
}

/* =========================================================
   RUTA DE PRUEBA
========================================================= */

app.get('/health', (req, res) => {
  res.json({
    estado: 'ok',
    mensaje: 'API de Gestión de Cursos funcionando.'
  });
});

/* =========================================================
   AUTENTICACIÓN
========================================================= */

app.post('/login', (req, res) => {
  const correo = String(
    req.body.correo || ''
  )
    .trim()
    .toLowerCase();

  const password = String(
    req.body.password || ''
  );

  if (!correo || !password) {
    return res.status(400).json({
      mensaje: 'Correo y contraseña son obligatorios.'
    });
  }

  const db = leerBaseDatos();

  const usuario = db.usuarios.find(
    elemento =>
      elemento.correo.toLowerCase() === correo &&
      elemento.password === password
  );

  if (!usuario) {
    return res.status(401).json({
      mensaje: 'Credenciales incorrectas.'
    });
  }

  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol
  };

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: '2h'
    }
  );

  return res.json({
    token,
    usuario: quitarPassword(usuario)
  });
});

/* =========================================================
   USUARIOS
   Solo el administrador puede gestionarlos.
========================================================= */

app.get(
  '/usuarios',
  autenticarToken,
  autorizarRoles('admin'),
  (req, res) => {
    const db = leerBaseDatos();

    const usuariosSeguros = db.usuarios.map(
      quitarPassword
    );

    res.json(usuariosSeguros);
  }
);

app.get(
  '/usuarios/:id',
  autenticarToken,
  autorizarRoles('admin'),
  (req, res) => {
    const db = leerBaseDatos();

    const usuario = db.usuarios.find(
      elemento =>
        String(elemento.id) === String(req.params.id)
    );

    if (!usuario) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    res.json(quitarPassword(usuario));
  }
);

app.post(
  '/usuarios',
  autenticarToken,
  autorizarRoles('admin'),
  (req, res) => {
    const db = leerBaseDatos();

    const nombre = String(
      req.body.nombre || ''
    ).trim();

    const correo = String(
      req.body.correo || ''
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body.password || ''
    );

    const rol = String(
      req.body.rol || ''
    );

    const rolesValidos = [
      'admin',
      'profesor',
      'estudiante'
    ];

    if (
      !nombre ||
      !correo ||
      !password ||
      !rolesValidos.includes(rol)
    ) {
      return res.status(400).json({
        mensaje:
          'Nombre, correo, contraseña y rol válido son obligatorios.'
      });
    }

    const correoExistente = db.usuarios.some(
      usuario =>
        usuario.correo.toLowerCase() === correo
    );

    if (correoExistente) {
      return res.status(409).json({
        mensaje: 'El correo ya está registrado.'
      });
    }

    const nuevoUsuario = {
      id: generarId(db.usuarios),
      nombre,
      correo,
      password,
      rol
    };

    db.usuarios.push(nuevoUsuario);
    guardarBaseDatos(db);

    return res.status(201).json(
      quitarPassword(nuevoUsuario)
    );
  }
);

app.put(
  '/usuarios/:id',
  autenticarToken,
  autorizarRoles('admin'),
  (req, res) => {
    const db = leerBaseDatos();

    const indice = db.usuarios.findIndex(
      usuario =>
        String(usuario.id) === String(req.params.id)
    );

    if (indice === -1) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    const usuarioActual = db.usuarios[indice];

    const nombre = String(
      req.body.nombre || ''
    ).trim();

    const correo = String(
      req.body.correo || ''
    )
      .trim()
      .toLowerCase();

    const rol = String(
      req.body.rol || ''
    );

    const passwordEnviado = String(
      req.body.password || ''
    );

    const rolesValidos = [
      'admin',
      'profesor',
      'estudiante'
    ];

    if (
      !nombre ||
      !correo ||
      !rolesValidos.includes(rol)
    ) {
      return res.status(400).json({
        mensaje:
          'Nombre, correo y rol válido son obligatorios.'
      });
    }

    const correoExistente = db.usuarios.some(
      usuario =>
        usuario.correo.toLowerCase() === correo &&
        String(usuario.id) !== String(req.params.id)
    );

    if (correoExistente) {
      return res.status(409).json({
        mensaje:
          'El correo pertenece a otro usuario.'
      });
    }

    const usuarioActualizado = {
      id: usuarioActual.id,
      nombre,
      correo,
      password:
        passwordEnviado || usuarioActual.password,
      rol
    };

    db.usuarios[indice] = usuarioActualizado;
    guardarBaseDatos(db);

    res.json(
      quitarPassword(usuarioActualizado)
    );
  }
);

app.delete(
  '/usuarios/:id',
  autenticarToken,
  autorizarRoles('admin'),
  (req, res) => {
    if (
      String(req.usuario.id) === String(req.params.id)
    ) {
      return res.status(400).json({
        mensaje:
          'No puedes eliminar el usuario con el que iniciaste sesión.'
      });
    }

    const db = leerBaseDatos();

    const indice = db.usuarios.findIndex(
      usuario =>
        String(usuario.id) === String(req.params.id)
    );

    if (indice === -1) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado.'
      });
    }

    db.usuarios.splice(indice, 1);
    guardarBaseDatos(db);

    res.status(204).send();
  }
);

/* =========================================================
   CURSOS
   Admin: ver, crear, editar y eliminar.
   Profesor: ver, crear y editar.
   Estudiante: solo ver.
========================================================= */

app.get(
  '/cursos',
  autenticarToken,
  autorizarRoles(
    'admin',
    'profesor',
    'estudiante'
  ),
  (req, res) => {
    const db = leerBaseDatos();
    res.json(db.cursos);
  }
);

app.get(
  '/cursos/:id',
  autenticarToken,
  autorizarRoles(
    'admin',
    'profesor',
    'estudiante'
  ),
  (req, res) => {
    const db = leerBaseDatos();

    const curso = db.cursos.find(
      elemento =>
        String(elemento.id) === String(req.params.id)
    );

    if (!curso) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado.'
      });
    }

    res.json(curso);
  }
);

app.post(
  '/cursos',
  autenticarToken,
  autorizarRoles('admin', 'profesor'),
  (req, res) => {
    const db = leerBaseDatos();

    const nombre = String(
      req.body.nombre || ''
    ).trim();

    const descripcion = String(
      req.body.descripcion || ''
    ).trim();

    if (!nombre || !descripcion) {
      return res.status(400).json({
        mensaje:
          'Nombre y descripción son obligatorios.'
      });
    }

    const nuevoCurso = {
      id: generarId(db.cursos),
      nombre,
      descripcion,
      creadoPor: req.usuario.id
    };

    db.cursos.push(nuevoCurso);
    guardarBaseDatos(db);

    res.status(201).json(nuevoCurso);
  }
);

app.put(
  '/cursos/:id',
  autenticarToken,
  autorizarRoles('admin', 'profesor'),
  (req, res) => {
    const db = leerBaseDatos();

    const indice = db.cursos.findIndex(
      curso =>
        String(curso.id) === String(req.params.id)
    );

    if (indice === -1) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado.'
      });
    }

    const cursoActual = db.cursos[indice];

    if (
  req.usuario.rol === 'profesor' &&
  String(cursoActual.creadoPor) !==
    String(req.usuario.id)
) {
  return res.status(403).json({
    mensaje:
      'El profesor solo puede editar sus propios cursos.'
  });
      return res.status(403).json({
        mensaje:
          'El profesor solo puede editar sus propios cursos.'
      });
    }

    const nombre = String(
      req.body.nombre || ''
    ).trim();

    const descripcion = String(
      req.body.descripcion || ''
    ).trim();

    if (!nombre || !descripcion) {
      return res.status(400).json({
        mensaje:
          'Nombre y descripción son obligatorios.'
      });
    }

    const cursoActualizado = {
      ...cursoActual,
      nombre,
      descripcion
    };

    db.cursos[indice] = cursoActualizado;
    guardarBaseDatos(db);

    res.json(cursoActualizado);
  }
);

app.delete(
  '/cursos/:id',
  autenticarToken,
  autorizarRoles('admin'),
  (req, res) => {
    const db = leerBaseDatos();

    const indice = db.cursos.findIndex(
      curso =>
        String(curso.id) === String(req.params.id)
    );

    if (indice === -1) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado.'
      });
    }

    db.cursos.splice(indice, 1);
    guardarBaseDatos(db);

    res.status(204).send();
  }
);

/* =========================================================
   RUTA NO ENCONTRADA Y MANEJO DE ERRORES
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    mensaje: 'Ruta de API no encontrada.'
  });
});

app.use((error, req, res, next) => {
  console.error('Error interno:', error);

  res.status(500).json({
    mensaje: 'Error interno del servidor.'
  });
});

/* =========================================================
   INICIAR SERVIDOR
========================================================= */

app.listen(PORT, () => {
  console.log('');
  console.log('==========================================');
  console.log(' API de Gestión de Cursos funcionando');
  console.log(` http://localhost:${PORT}`);
  console.log(` Prueba: http://localhost:${PORT}/health`);
  console.log('==========================================');
  console.log('');
});