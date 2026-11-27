# Datos de demostracion (seed)

Este comando carga usuarios y libros de ejemplo para probar la aplicacion sin registrar nada.

## Requisitos

- Haber instalado las dependencias del backend (`npm install` en `backend/`).
- Tener `backend/.env` con `JWT_SECRET` definido.

## Ejecucion

```powershell
cd backend
npm run seed
```

Al terminar, el comando muestra cuantos usuarios y libros se crearon y cuantos ya existian.

## Usuarios de prueba

| Correo | Contraseña |
|---|---|
| demo1@example.com | clave-demo-1234 |
| demo2@example.com | clave-demo-1234 |

Son datos de demostracion. No usar estas credenciales para nada real.

## Comportamiento

- Es idempotente: si se ejecuta varias veces, no duplica usuarios ni libros.
- No se ejecuta al arrancar el servidor; solo con `npm run seed`.
- Escribe en la base indicada por `DATABASE_PATH` (por defecto `backend/data/foliante.db`).

## Reiniciar los datos

Para empezar de cero, detener el servidor, borrar `backend/data/foliante.db` y volver a ejecutar `npm run dev` y luego `npm run seed`.
