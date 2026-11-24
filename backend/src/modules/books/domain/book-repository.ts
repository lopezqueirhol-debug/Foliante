import type { Book, NewBook } from './book';

export type BookChanges = Partial<Omit<Book, 'id' | 'createdAt'>>;

export interface BookRepository {
  create(newBook: NewBook): Book;
  findAll(): Book[];
  findById(id: number): Book | null;
  update(id: number, changes: BookChanges): Book | null;
  delete(id: number): boolean;
}