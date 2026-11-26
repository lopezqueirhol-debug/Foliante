import { createApp } from './app';
import { config } from './shared/config';
import { initDatabase } from './shared/database';
import { SqliteBookRepository } from './modules/books/infrastructure/sqlite-book-repository';

const db = initDatabase(config.databasePath);
const repository = new SqliteBookRepository(db);
const app = createApp(repository);

app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
