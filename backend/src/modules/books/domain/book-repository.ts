import type { Book, NewBook } from './book';

export type BookChanges = Partial<Omit<Book, 'id' | 'userId' | 'createdAt'>>;

export interface BookRepository {
  create(newBook: NewBook): Book;
  findAll(userId: number): Book[];
  findById(id: number, userId: number): Book | null;
  update(id: number, userId: number, changes: BookChanges): Book | null;
  delete(id: number, userId: number): boolean;
}
