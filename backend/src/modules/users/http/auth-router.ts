import { Router } from 'express';
import type { PasswordHasher } from '../domain/password-hasher';
import type { TokenService } from '../domain/token-service';
import type { UserRepository } from '../domain/user-repository';
import { registerUser } from '../application/register-user';
import { loginUser } from '../application/login-user';
import {
  createdResponse,
  okResponse,
  errorResponse,
} from '../../../shared/http/http-responses';

const INVALID_BODY_MESSAGE = 'El cuerpo debe estar en formato JSON.';

export function createAuthRouter(
  repository: UserRepository,
  hasher: PasswordHasher,
  tokenService: TokenService,
) {
  const router = Router();

  router.post('/register', async (req, res) => {
    if (typeof req.body !== 'object' || req.body === null) {
      const response = errorResponse(400, [INVALID_BODY_MESSAGE]);
      return res.status(response.status).json(response.body);
    }

    const result = await registerUser(repository, hasher, {
      email: req.body.email,
      password: req.body.password,
    });

    if (!result.ok) {
      const status = result.reason === 'duplicate_email' ? 409 : 400;
      const response = errorResponse(
        status,
        result.errors.map((error) => error.message),
      );
      return res.status(response.status).json(response.body);
    }

    const response = createdResponse({
      id: result.user.id,
      email: result.user.email,
    });
    return res.status(response.status).json(response.body);
  });

  router.post('/login', async (req, res) => {
    if (typeof req.body !== 'object' || req.body === null) {
      const response = errorResponse(400, [INVALID_BODY_MESSAGE]);
      return res.status(response.status).json(response.body);
    }

    const result = await loginUser(repository, hasher, {
      email: req.body.email,
      password: req.body.password,
    });

    if (!result.ok) {
      const status = result.reason === 'invalid_credentials' ? 401 : 400;
      const response = errorResponse(
        status,
        result.errors.map((error) => error.message),
      );
      return res.status(response.status).json(response.body);
    }

    const response = okResponse({
      token: tokenService.sign(result.user.id),
    });
    return res.status(response.status).json(response.body);
  });

  return router;
}
