# Foliante

Aplicacion de biblioteca personal. Permite registrarse, iniciar sesion y gestionar los libros de cada usuario: crear, listar, editar, borrar y marcarlos como terminados. Incluye una grafica de libros terminados por mes.

Proyecto de la asignatura Programacion III (ITLA), desarrollado con Git Flow.

## Tecnologias

- Backend: TypeScript, Express 5, SQLite (`node:sqlite`), bcryptjs, jsonwebtoken.
- Frontend: TypeScript, Vite, DOM nativo, Chart.js.

## Requisitos

- Node.js 24 o superior (el backend usa `node:sqlite`, integrado en Node).
- npm.

## Backend

```powershell
cd backend
npm install
copy .env.example .env
```

Edita `backend/.env` y define `JWT_SECRET` con un valor largo y propio. Luego:

```powershell
npm run dev
```

La API queda en `http://localhost:3000`.

Variables de `.env`:
- `JWT_SECRET` (obligatoria): secreto para firmar los tokens. Si falta, el servidor no arranca.
- `JWT_EXPIRES_IN` (opcional, por defecto `1h`).
- `PORT` (opcional, por defecto `3000`).
- `DATABASE_PATH` (opcional, por defecto `./data/foliante.db`).

### Datos de demostracion

Para cargar usuarios y libros de ejemplo, detén el backend antes de ejecutar el comando (recomendado para evitar bloqueos de SQLite):

```powershell
cd backend
npm run seed
```

Usuarios: `demo1@example.com` y `demo2@example.com`, contraseña `clave-demo-1234`. Ver `backend/SEED.md`.

## Frontend

En otra terminal, con el backend corriendo:

```powershell
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. El frontend llama a `/api` a traves del proxy de Vite, por lo que no necesita CORS.

## Cambios de esquema

La base de datos se crea al arrancar. Si cambia el esquema, `CREATE TABLE IF NOT EXISTS` no altera tablas existentes, asi que hay que borrar `backend/data/foliante.db` y arrancar de nuevo. Esto borra todos los datos locales.

## Endpoints

| Metodo | Ruta | Descripcion | Auth |
|---|---|---|---|
| GET | `/api/health` | Estado del servidor | No |
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesion, devuelve `token` | No |
| GET | `/api/books` | Listar libros del usuario | Si |
| POST | `/api/books` | Crear libro | Si |
| GET | `/api/books/:id` | Obtener libro | Si |
| PUT | `/api/books/:id` | Actualizar libro | Si |
| DELETE | `/api/books/:id` | Borrar libro | Si |
| GET | `/api/books/stats/finished-by-month` | Libros terminados por mes | Si |

Autenticacion: enviar `Authorization: Bearer <token>`. Los errores siguen el formato `{ "errors": ["mensaje"] }`.

## Flujo de ramas

- Ramas base: `main`, `dev`, `qa`.
- Cada `feature/` o `hotfix/` nace de `dev` y tiene tres PR: a `dev`, a `qa` y a `main`.
- Orden de fusion: `dev` → `qa` → `main`, con merge commit.

## Limitaciones conocidas

- El JWT no tiene revocacion: al cerrar sesion solo se borra el token del navegador.
- El modo oscuro sigue la preferencia del sistema; no hay boton para cambiarlo.
- Si la sesion expira al escribir, el mensaje de sesion expirada no se muestra en esa pantalla.
