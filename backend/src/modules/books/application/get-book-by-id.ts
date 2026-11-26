import { Book } from '../domain/book';
import { BookRepository } from '../domain/book-repository';

export type GetBookByIdResult =
  { ok: true; book: Book } | { ok: false; reason: 'not_found' };

export function getBookById(
  repository: BookRepository,
  id: number,
): GetBookByIdResult {
  const book = repository.findById(id);

  if (!book) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true, book };
}
