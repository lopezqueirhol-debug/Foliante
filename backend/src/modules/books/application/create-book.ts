import { Book, NewBook } from '../domain/book';
import { BookRepository } from '../domain/book-repository';
import { validateNewBook, duplicateIsbnError } from '../domain/book-rules';

export type CreateBookResult =
  | { ok: true; book: Book }
  | { ok: false; reason: 'validation'; errors: Error[] }
  | { ok: false; reason: 'duplicate_isbn'; errors: Error[] };

export function createBook(
  repository: BookRepository,
  newBook: NewBook,
): CreateBookResult {
  const errors = validateNewBook(newBook);
  if (errors.length > 0) {
    return { ok: false, reason: 'validation', errors };
  }

  let created: Book;

  try {
    created = repository.create(newBook);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      return {
        ok: false,
        reason: 'duplicate_isbn',
        errors: [duplicateIsbnError()],
      };
    }
    throw err;
  }
  return { ok: true, book: created };
}
