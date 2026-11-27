import type { NextFunction, Request, Response } from 'express';
import type { TokenService } from '../domain/token-service';
import { errorResponse } from '../../../shared/http/http-responses';

const UNAUTHORIZED_MESSAGE = 'Token invalido o ausente.';
const BEARER_PREFIX = 'Bearer ';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number;
  }
}

export function createAuthMiddleware(tokenService: TokenService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith(BEARER_PREFIX)) {
      const response = errorResponse(401, [UNAUTHORIZED_MESSAGE]);
      return res.status(response.status).json(response.body);
    }

    const userId = tokenService.verify(header.slice(BEARER_PREFIX.length));

    if (userId === null) {
      const response = errorResponse(401, [UNAUTHORIZED_MESSAGE]);
      return res.status(response.status).json(response.body);
    }

    req.userId = userId;
    return next();
  };
}
