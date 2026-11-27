import { FinishedByMonth } from '../domain/book';
import { BookRepository } from '../domain/book-repository';

export function listFinishedBooksByMonth(
  repository: BookRepository,
  userId: number,
): FinishedByMonth[] {
  return repository.countFinishedByMonth(userId);
}
