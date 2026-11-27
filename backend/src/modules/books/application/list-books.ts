import { Book } from '../domain/book';
import { BookRepository } from '../domain/book-repository';

export function listBooks(repository: BookRepository, userId: number): Book[] {
  return repository.findAll(userId);
}
