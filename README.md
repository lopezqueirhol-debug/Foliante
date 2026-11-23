# Foliante

Aplicacion web para llevar el registro de tu biblioteca personal: libros, estado de lectura y progreso por mes.

## Funcionalidades (al estar terminado)

- Registro e inicio de sesion de usuarios
- Crear, listar, editar y eliminar libros
- Cada usuario ve unicamente sus propios libros
- Grafica de libros terminados por mes

## Tecnologias

- **Backend:** TypeScript, Express, SQLite
- **Frontend:** TypeScript, Vite, HTML, CSS, Fetch API, Chart.js
- **Seguridad:** hash de contraseñas con bcrypt, autenticacion con JWT

## Estructura

```
backend/src/
  shared/          # configuracion de base de datos, errores comunes
  modules/
    auth/          # registro, login, JWT
    books/         # CRUD de libros
  app.ts
  server.ts
frontend/src/
  shared/api/      # cliente Fetch
  modules/books/   # interfaz de libros y grafica
  main.ts
```

Cada modulo sigue capas `domain`, `application`, `infrastructure` y `http`, para que agregar nuevas funciones (peliculas, musica) no afecte a los modulos existentes.

## Requisitos

- Node.js 20 o superior
- npm

## Instalacion

```bash
git clone https://github.com/lopezqueirhol-debug/Foliante.git
cd Foliante
```

Las instrucciones detalladas de ejecucion se agregaran al final del proyecto.

## Variables de entorno

Crea un archivo `.env` en `backend/` (no se sube al repositorio):

```
PORT=3000
JWT_SECRET=cambia_esta_clave
DATABASE_PATH=./data/foliante.db
```

## Autor

Queirhol Luis Lopez Rodriguez
2025-1986
Instituto Tecnologico de Las Americas (ITLA), Programacion III
