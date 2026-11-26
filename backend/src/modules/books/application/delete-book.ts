import { BookRepository } from '../domain/book-repository';

export type DeleteBookResult =
  { ok: true } | { ok: false; reason: 'not_found' };

export function deleteBook(
  repository: BookRepository,
  id: number,
): DeleteBookResult {
  const deleted = repository.delete(id);

  if (!deleted) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true };
}
