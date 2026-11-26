import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import type { BookRepository } from './modules/books/domain/book-repository';

import { createBooksRouter } from './modules/books/http/books-router';

export function createApp(repository: BookRepository): Application {
  const app: Application = express();

  app.use(express.json());

  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', createBooksRouter(repository));

  return app;
}
