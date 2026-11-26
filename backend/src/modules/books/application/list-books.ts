import { Book } from '../domain/book';
import { BookRepository } from '../domain/book-repository';

export function listBooks(repository: BookRepository): Book[] {
  return repository.findAll();
}
