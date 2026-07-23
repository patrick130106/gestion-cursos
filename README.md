# Sistema de Gestión de Cursos y Usuarios

Aplicación web SPA desarrollada en Angular para gestionar usuarios y cursos de una institución educativa.

El sistema implementa autenticación mediante JWT, autorización por roles, rutas protegidas, Lazy Loading, consumo de una API REST y operaciones CRUD.

---

## Integrantes

- Integrante 1: Patrick Paul Garcia Quispe
- Integrante 2: Neyler Yair Flores Iparraguirre
- Integrante 3: Hector Chira Culquicondor

---

## Descripción del proyecto

La institución educativa realizaba manualmente los procesos de gestión de cursos y usuarios, sin contar con un sistema centralizado ni controles adecuados de acceso.

La aplicación permite:

- Iniciar sesión mediante correo y contraseña.
- Gestionar usuarios.
- Gestionar cursos.
- Proteger rutas privadas.
- Controlar las funcionalidades según el rol del usuario.
- Consumir una API REST.
- Utilizar JWT para autenticar las peticiones.
- Navegar como una SPA sin recargar completamente la página.

---

## Tecnologías utilizadas

### Frontend

- Angular 22
- TypeScript
- Angular Router
- HttpClient
- FormsModule
- Signals
- Bootstrap 5
- HTML5
- CSS3

### Backend

- Node.js
- Express
- JSON Web Token
- CORS
- dotenv
- Base de datos simulada mediante archivo JSON

---

## Funcionalidades

### Autenticación

- Inicio de sesión mediante correo y contraseña.
- Generación de un JWT firmado desde la API.
- Almacenamiento del token en Local Storage.
- Verificación de expiración del token.
- Cierre automático de sesión cuando el token es inválido.
- Cierre de sesión manual.

### Enrutamiento

- Ruta pública para el Login.
- Rutas privadas para Dashboard, Usuarios y Cursos.
- Rutas anidadas mediante un Layout.
- Lazy Loading con `loadComponent`.
- Página personalizada para rutas no encontradas.

### Guards

- `AuthGuard`: restringe el acceso a usuarios no autenticados.
- `RoleGuard`: restringe las rutas según el rol del usuario.

### Interceptor

El interceptor agrega automáticamente el encabezado:

```http
Authorization: Bearer TOKEN_JWT