import { createApp } from './app';
import { config } from './shared/config';
import { initDatabase } from './shared/database';
import { SqliteBookRepository } from './modules/books/infrastructure/sqlite-book-repository';
import { SqliteUserRepository } from './modules/users/infrastructure/sqlite-user-repository';
import { BcryptPasswordHasher } from './modules/users/infrastructure/bcrypt-password-hasher';
import { JwtTokenService } from './modules/users/infrastructure/jwt-token-service';

const db = initDatabase(config.databasePath);

const app = createApp({
  bookRepository: new SqliteBookRepository(db),
  userRepository: new SqliteUserRepository(db),
  passwordHasher: new BcryptPasswordHasher(),
  tokenService: new JwtTokenService(),
});

app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
