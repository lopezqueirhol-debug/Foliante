const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('Falta la variable de entorno JWT_SECRET');
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  databasePath: process.env.DATABASE_PATH ?? './data/foliante.db',
  jwtSecret,
};
