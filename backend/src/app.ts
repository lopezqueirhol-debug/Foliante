import express, {
  type NextFunction,
  type Application,
  type Request,
  type Response,
} from 'express';
import type { BookRepository } from './modules/books/domain/book-repository';
import type { UserRepository } from './modules/users/domain/user-repository';
import type { PasswordHasher } from './modules/users/domain/password-hasher';
import type { TokenService } from './modules/users/domain/token-service';
import { createBooksRouter } from './modules/books/http/books-router';
import { createAuthRouter } from './modules/users/http/auth-router';

export interface AppDependencies {
  bookRepository: BookRepository;
  userRepository: UserRepository;
  passwordHasher: PasswordHasher;
  tokenService: TokenService;
}

function isJsonParseError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    err.type === 'entity.parse.failed'
  );
}

export function createApp(deps: AppDependencies): Application {
  const app: Application = express();

  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(
    '/api/auth',
    createAuthRouter(
      deps.userRepository,
      deps.passwordHasher,
      deps.tokenService,
    ),
  );
  app.use('/api', createBooksRouter(deps.bookRepository));

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
