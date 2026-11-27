import { Router } from 'express';
import { BookChanges, BookRepository } from '../domain/book-repository';
import type { TokenService } from '../../users/domain/token-service';
import { createAuthMiddleware } from '../../users/http/auth-middleware';
import {
  createdResponse,
  okResponse,
  noContentResponse,
} from '../../../shared/http/http-responses';
import { failureResponse } from './book-responses';
import { createBook } from '../application/create-book';
import { listBooks } from '../application/list-books';
import { getBookById } from '../application/get-book-by-id';
import { updateBook } from '../application/update-book';
import { deleteBook } from '../application/delete-book';

function parseBookId(raw: string): number | null {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

const INVALID_ID_MESSAGE = 'El id debe ser un entero positivo.';
const INVALID_BODY_MESSAGE = 'El cuerpo debe estar en formato JSON.';

export function createBooksRouter(
  repository: BookRepository,
  tokenService: TokenService,
) {
  const router = Router();

  router.use(createAuthMiddleware(tokenService));

  router.post('/books', (req, res) => {
    if (typeof req.body !== 'object' || req.body === null) {
      return res.status(400).json({ errors: [INVALID_BODY_MESSAGE] });
    }

    const newBook = {
      userId: req.userId!,
      title: req.body.title,
      isbn: req.body.isbn,
      publishedYear: req.body.publishedYear ?? null,
      available: req.body.available ?? true,
      finishedAt: req.body.finishedAt ?? null,
    };

    const result = createBook(repository, newBook);

    if (!result.ok) {
      const response = failureResponse(result);
      return res.status(response.status).json(response.body);
    }

    const response = createdResponse(result.book);
    return res.status(response.status).json(response.body);
  });

  router.get('/books', (req, res) => {
    const books = listBooks(repository, req.userId!);
    const response = okResponse(books);
    return res.status(response.status).json(response.body);
  });

  router.get('/books/:id', (req, res) => {
    const id = parseBookId(req.params.id);

    if (id === null) {
      return res.status(400).json({ errors: [INVALID_ID_MESSAGE] });
    }

    const result = getBookById(repository, id, req.userId!);

    if (!result.ok) {
      const response = failureResponse(result);
      return res.status(response.status).json(response.body);
    }

    const response = okResponse(result.book);
    return res.status(response.status).json(response.body);
  });

  router.put('/books/:id', (req, res) => {
    const id = parseBookId(req.params.id);

    if (id === null) {
      return res.status(400).json({ errors: [INVALID_ID_MESSAGE] });
    }

    if (typeof req.body !== 'object' || req.body === null) {
      return res.status(400).json({ errors: [INVALID_BODY_MESSAGE] });
    }

    const changes: BookChanges = {};

    if (req.body.title !== undefined) {
      changes.title = req.body.title;
    }
    if (req.body.isbn !== undefined) {
      changes.isbn = req.body.isbn;
    }
    if (req.body.publishedYear !== undefined) {
      changes.publishedYear = req.body.publishedYear;
    }
    if (req.body.available !== undefined) {
      changes.available = req.body.available;
    }
    if (req.body.finishedAt !== undefined) {
      changes.finishedAt = req.body.finishedAt;
    }

    const result = updateBook(repository, id, req.userId!, changes);

    if (!result.ok) {
      const response = failureResponse(result);
      return res.status(response.status).json(response.body);
    }

    const response = okResponse(result.book);
    return res.status(response.status).json(response.body);
  });

  router.delete('/books/:id', (req, res) => {
    const id = parseBookId(req.params.id);

    if (id === null) {
      return res.status(400).json({ errors: [INVALID_ID_MESSAGE] });
    }

    const result = deleteBook(repository, id, req.userId!);

    if (!result.ok) {
      const response = failureResponse(result);
      return res.status(response.status).json(response.body);
    }

    const response = noContentResponse();
    return res.status(response.status).end();
  });

  return router;
}
