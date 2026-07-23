# Sistema de Gestión de Cursos y Usuarios

Aplicación web SPA desarrollada con Angular y una API REST en Node.js/Express para centralizar la gestión de usuarios y cursos de una institución educativa.

El sistema incluye autenticación mediante JWT, autorización por roles, rutas protegidas, Lazy Loading, consumo de servicios REST, operaciones CRUD y una interfaz administrativa responsive.

---

## Integrantes

- **Patrick Paul Garcia Quispe**
- **Neyler Yair Flores Iparraguirre**
- **Hector Chira Culquicondor**

---

## Situación problemática

La institución educativa realiza procesos de gestión de cursos y usuarios de forma manual y sin un control adecuado sobre el acceso a las funcionalidades.

Esta situación genera problemas como:

- Falta de seguridad en el acceso a los datos.
- Información distribuida en diferentes plataformas.
- Dificultad para administrar usuarios y cursos.
- Ausencia de permisos según el tipo de usuario.
- Procesos lentos y repetitivos.
- Riesgo de accesos no autorizados.

Para resolver estos inconvenientes se desarrolló una aplicación web SPA que centraliza la información, protege la navegación y permite administrar usuarios y cursos según el rol asignado.

---

## Objetivo general

Desarrollar una aplicación web SPA en Angular que permita gestionar usuarios y cursos de forma centralizada, utilizando autenticación JWT, rutas protegidas, autorización por roles y consumo de una API REST.

---

## Objetivos específicos

- Implementar un sistema de inicio de sesión con JWT.
- Proteger las rutas privadas mediante `AuthGuard`.
- Restringir funcionalidades según el rol mediante `RoleGuard`.
- Implementar Lazy Loading para optimizar la carga de componentes.
- Consumir una API REST mediante `HttpClient`.
- Implementar el CRUD completo de usuarios.
- Implementar el CRUD completo de cursos.
- Agregar automáticamente el JWT mediante un interceptor HTTP.
- Mantener una navegación fluida como SPA.
- Mostrar opciones dinámicas según el tipo de usuario.
- Validar permisos tanto en Angular como en la API.

---

## Tecnologías utilizadas

### Frontend

- Angular 22.0.7
- Angular CLI 22.0.7
- TypeScript
- Angular Router
- HttpClient
- Formularios con `FormsModule`
- Signals
- Bootstrap 5
- HTML5
- CSS3

### Backend

- Node.js
- Express
- JSON Web Token (`jsonwebtoken`)
- CORS
- dotenv
- Archivo JSON como base de datos simulada

### Herramientas

- Visual Studio Code
- Git
- GitHub
- npm
- Google Chrome DevTools

---

## Arquitectura del proyecto

El sistema está dividido en dos partes:

```text
Angular SPA
    ↓
HttpClient + Interceptor JWT
    ↓
API REST Node.js / Express
    ↓
Validación JWT y permisos por rol
    ↓
Archivo api/db.json
```

El frontend se ejecuta normalmente en:

```text
http://localhost:4200
```

La API se ejecuta normalmente en:

```text
http://localhost:3000
```

---

## Funcionalidades principales

### Autenticación

- Inicio de sesión mediante correo y contraseña.
- Validación de credenciales desde la API.
- Generación de un JWT firmado.
- Almacenamiento del token en `localStorage`.
- Almacenamiento de la información básica del usuario.
- Validación de expiración del token.
- Cierre de sesión manual.
- Cierre automático de sesión cuando el token es inválido o ha expirado.
- Mensaje de sesión expirada en el Login.

### Enrutamiento

- Ruta pública para el Login.
- Rutas privadas para Dashboard, Usuarios y Cursos.
- Rutas anidadas dentro de un Layout.
- Página personalizada para rutas no encontradas.
- Lazy Loading mediante `loadComponent`.
- Navegación SPA sin recarga completa de la página.

### Seguridad

- `AuthGuard` para proteger rutas privadas.
- `RoleGuard` para controlar rutas según el rol.
- Interceptor para agregar el token a las peticiones.
- Validación del JWT desde la API.
- Control de permisos en el frontend y backend.
- Manejo de respuestas `401 Unauthorized`.
- Manejo de respuestas `403 Forbidden`.
- La clave JWT se almacena en un archivo `.env`.
- Las contraseñas no se devuelven al listar usuarios.

### Gestión de usuarios

- Listar usuarios.
- Registrar usuarios.
- Editar usuarios.
- Eliminar usuarios.
- Validar formularios.
- Evitar correos duplicados.
- Evitar que el administrador elimine su propia cuenta activa.
- Mantener la contraseña actual cuando se edita un usuario y el campo se deja vacío.

### Gestión de cursos

- Listar cursos.
- Registrar cursos.
- Editar cursos.
- Eliminar cursos.
- Registrar qué usuario creó cada curso.
- Permitir al profesor editar únicamente sus propios cursos.
- Mostrar los cursos en modo solo lectura para estudiantes.

---

## Roles y permisos

| Funcionalidad | Administrador | Profesor | Estudiante |
|---|---:|---:|---:|
| Iniciar sesión | Sí | Sí | Sí |
| Ver Dashboard | Sí | Sí | Sí |
| Ver usuarios | Sí | No | No |
| Crear usuarios | Sí | No | No |
| Editar usuarios | Sí | No | No |
| Eliminar usuarios | Sí | No | No |
| Ver cursos | Sí | Sí | Sí |
| Crear cursos | Sí | Sí | No |
| Editar cursos | Todos | Solo los propios | No |
| Eliminar cursos | Sí | No | No |
| Cerrar sesión | Sí | Sí | Sí |

---

## Credenciales de prueba

### Administrador

```text
Correo: admin@gmail.com
Contraseña: 123456
```

### Profesor

```text
Correo: profesor@gmail.com
Contraseña: 123456
```

### Estudiante

```text
Correo: estudiante@gmail.com
Contraseña: 123456
```

---

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Pública | Inicio de sesión |
| `/dashboard` | Autenticados | Panel principal |
| `/usuarios` | Solo administrador | CRUD de usuarios |
| `/cursos` | Admin, profesor y estudiante | Gestión o consulta de cursos |
| `/**` | General | Página no encontrada |

---

## Guards implementados

### AuthGuard

Verifica si existe una sesión válida antes de permitir el acceso a las rutas privadas.

Flujo:

```text
Usuario intenta entrar a una ruta privada
        ↓
AuthGuard verifica el JWT
        ↓
Token válido → permite el acceso
Token inexistente o inválido → redirige a /login
```

### RoleGuard

Verifica si el rol del usuario está incluido en los roles permitidos de la ruta.

Ejemplo de configuración:

```typescript
{
  path: 'usuarios',
  canActivate: [roleGuard],
  data: {
    roles: ['admin']
  }
}
```

---

## Lazy Loading

Los componentes se cargan dinámicamente mediante `loadComponent`.

Ejemplo:

```typescript
{
  path: 'usuarios',
  loadComponent: () =>
    import('./pages/usuarios/usuarios')
      .then(modulo => modulo.Usuarios)
}
```

Durante la compilación se generan archivos independientes para:

- Login
- Layout
- Dashboard
- Usuarios
- Cursos
- Página 404

Para comprobarlo:

```bash
ng build
```

La terminal debe mostrar una sección llamada:

```text
Lazy chunk files
```

---

## Interceptor HTTP

El interceptor agrega automáticamente el token JWT a las peticiones protegidas:

```http
Authorization: Bearer TOKEN_JWT
```

También realiza las siguientes acciones:

- Detecta respuestas `401 Unauthorized`.
- Elimina la sesión inválida.
- Redirige al Login.
- Muestra un mensaje de sesión expirada.
- Mantiene la sesión cuando la respuesta es `403 Forbidden`.

---

## API REST

### URL local

```text
http://localhost:3000
```

### Comprobar que la API funciona

```text
GET http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "estado": "ok",
  "mensaje": "API de Gestión de Cursos funcionando."
}
```

---

## Endpoints

### Autenticación

```http
POST /login
```

Cuerpo de la petición:

```json
{
  "correo": "admin@gmail.com",
  "password": "123456"
}
```

Respuesta esperada:

```json
{
  "token": "JWT_GENERADO",
  "usuario": {
    "id": 1,
    "nombre": "Administrador",
    "correo": "admin@gmail.com",
    "rol": "admin"
  }
}
```

### Usuarios

| Método | Endpoint | Permiso |
|---|---|---|
| GET | `/usuarios` | Admin |
| GET | `/usuarios/:id` | Admin |
| POST | `/usuarios` | Admin |
| PUT | `/usuarios/:id` | Admin |
| DELETE | `/usuarios/:id` | Admin |

### Cursos

| Método | Endpoint | Permiso |
|---|---|---|
| GET | `/cursos` | Admin, profesor y estudiante |
| GET | `/cursos/:id` | Admin, profesor y estudiante |
| POST | `/cursos` | Admin y profesor |
| PUT | `/cursos/:id` | Admin y profesor con restricciones |
| DELETE | `/cursos/:id` | Admin |

Todos los endpoints protegidos requieren:

```http
Authorization: Bearer TOKEN_JWT
```

---

## Estructura del proyecto

```text
gestion-cursos/
│
├── api/
│   ├── db.json
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── .env                 # No se sube a GitHub
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── guards/
│   │   │   ├── auth-guard.ts
│   │   │   └── role-guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth-interceptor.ts
│   │   │
│   │   ├── models/
│   │   │   ├── usuario.ts
│   │   │   └── curso.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── usuarios/
│   │   │   └── cursos/
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── usuarios.service.ts
│   │   │   └── cursos.service.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── layout/
│   │   │   ├── navbar/
│   │   │   ├── sidebar/
│   │   │   └── not-found/
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.css
│   │
│   ├── main.ts
│   └── styles.css
│
├── .gitignore
├── angular.json
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```

---

## Requisitos previos

Antes de ejecutar el proyecto se debe tener instalado:

- Node.js
- npm
- Angular CLI
- Git

Comprobar las instalaciones:

```bash
node -v
npm -v
ng version
git --version
```

Versiones utilizadas durante el desarrollo:

```text
Angular CLI: 22.0.7
Angular: 22.0.7
Node.js: 24.18.0
npm: 11.16.0
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/patrick130106/gestion-cursos
```

### 2. Entrar a la carpeta

```bash
cd gestion-cursos
```

### 3. Instalar dependencias de Angular

```bash
npm install
```

### 4. Instalar dependencias de la API

```bash
cd api
npm install
```

### 5. Crear el archivo `.env`

Dentro de la carpeta `api`, crear un archivo llamado:

```text
.env
```

Tomar como referencia:

```text
.env.example
```

Contenido sugerido:

```env
PORT=3000
JWT_SECRET=colocar_una_clave_secreta_segura
```

No se debe subir el archivo `.env` al repositorio.

---

## Ejecución del proyecto

Se necesitan dos terminales.

### Terminal 1: iniciar la API

Desde la raíz del proyecto:

```bash
cd api
npm run dev
```

La API estará disponible en:

```text
http://localhost:3000
```

### Terminal 2: iniciar Angular

Desde la raíz del proyecto:

```bash
ng serve
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

---

## Compilación de producción

Ejecutar:

```bash
ng build
```

La compilación se guarda en:

```text
dist/gestion-cursos
```

La compilación final debe mostrar:

```text
Application bundle generation complete.
```

y una sección con:

```text
Lazy chunk files
```

---

## Pruebas funcionales realizadas

- Login con credenciales correctas.
- Login con credenciales incorrectas.
- Generación de JWT firmado.
- Almacenamiento del JWT en Local Storage.
- Envío automático del encabezado Authorization.
- Redirección al Login cuando no existe sesión.
- Restricción de rutas por rol.
- Rechazo de un token manipulado.
- Cierre automático de sesión ante respuesta 401.
- CRUD completo de usuarios.
- CRUD completo de cursos.
- Restricciones de edición para profesores.
- Vista de solo lectura para estudiantes.
- Cierre de sesión.
- Rutas anidadas.
- Lazy Loading.
- Página 404.
- Compilación de producción exitosa.

---

## Seguridad y consideraciones

- El JWT está firmado desde la API.
- La API verifica la autenticidad y expiración del token.
- Los permisos son validados en el frontend y backend.
- La clave secreta se guarda en `.env`.
- El archivo `.env` está excluido mediante `.gitignore`.
- Las contraseñas no se devuelven al listar usuarios.
- El sistema evita que el administrador elimine su propia sesión activa.
- Los profesores solo pueden editar sus propios cursos.

---

## Estado del proyecto

- [x] Login con JWT
- [x] AuthGuard
- [x] RoleGuard
- [x] HttpInterceptor
- [x] Rutas anidadas
- [x] Lazy Loading
- [x] CRUD de usuarios
- [x] CRUD de cursos
- [x] Restricciones por rol
- [x] Layout responsive
- [x] Compilación de producción
- [x] Enlace final de GitHub
- [x] Documento PDF con evidencias


---

## Enlace del repositorio

```text
https://github.com/patrick130106/gestion-cursos
```

---

## Autores

Proyecto desarrollado por:

- Patrick Paul Garcia Quispe
- Neyler Yair Flores Iparraguirre
- Hector Chira Culquicondor

Actividad grupal de desarrollo de una aplicación web SPA en Angular para la gestión centralizada y segura de usuarios y cursos.