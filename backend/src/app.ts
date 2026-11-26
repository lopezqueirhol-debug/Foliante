import express, {
  type NextFunction,
  type Application,
  type Request,
  type Response,
} from 'express';
import type { BookRepository } from './modules/books/domain/book-repository';
import { createBooksRouter } from './modules/books/http/books-router';

function isJsonParseError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    err.type === 'entity.parse.failed'
  );
}

export function createApp(repository: BookRepository): Application {
  const app: Application = express();

  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', createBooksRouter(repository));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (isJsonParseError(err)) {
      res
        .status(400)
        .json({ errors: ['El cuerpo de la peticion no es un JSON valido.'] });
      return;
    }

    console.error(err);
    res.status(500).json({ errors: ['Error interno del servidor.'] });
  });

  return app;
}
