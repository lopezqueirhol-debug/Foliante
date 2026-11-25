import { Book } from '../domain/book';
import { BookChanges, BookRepository } from '../domain/book-repository';
import { validateBookChanges } from '../domain/book-rules';

export type UpdateBookResult =
  | { ok: true; book: Book }
  | { ok: false; reason: 'not_found' }
  | { ok: false; reason: 'validation'; errors: Error[] }
  | { ok: false; reason: 'duplicate_isbn'; errors: Error[] };

export function updateBook(
  repository: BookRepository,
  id: number,
  changes: BookChanges,
): UpdateBookResult {
  const errors = validateBookChanges(changes);
  if (errors.length > 0) {
    return { ok: false, reason: 'validation', errors };
  }

  let updated: Book | null;

  try {
    updated = repository.update(id, changes);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes('UNIQUE constraint failed')
    ) {
      return {
        ok: false,
        reason: 'duplicate_isbn',
        errors: [new Error('El ISBN ya esta registrado en otro libro.')],
      };
    }
    throw err;
  }

  if (!updated) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true, book: updated };
}
