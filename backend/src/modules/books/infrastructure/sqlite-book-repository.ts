import { DatabaseSync } from 'node:sqlite';
import { NewBook, Book } from '../domain/book';
import { BookChanges, BookRepository } from '../domain/book-repository';

interface BookRow {
  id: number;
  user_id: number;
  title: string;
  isbn: string;
  published_year: number | null;
  available: number;
  created_at: string;
}

export class SqliteBookRepository implements BookRepository {
  constructor(private readonly db: DatabaseSync) {}

  create(newBook: NewBook): Book {
    const stmt = this.db.prepare(`
            INSERT INTO books (user_id, title, isbn, published_year, available)
            VALUES (?, ?, ?, ?, ?)
        `);

    const result = stmt.run(
      newBook.userId,
      newBook.title,
      newBook.isbn,
      newBook.publishedYear,
      newBook.available ? 1 : 0,
    );

    const book = this.findRowById(Number(result.lastInsertRowid));
    if (!book) {
      throw new Error('No se pudo leer el libro recien creado');
    }
    return book;
  }

  findAll(userId: number): Book[] {
    const stmt = this.db.prepare(
      'SELECT * FROM books WHERE user_id = ? ORDER BY id ASC',
    );
    const rows = stmt.all(userId) as unknown as BookRow[];

    return rows.map((row) => this.toBook(row));
  }

  findById(id: number, userId: number): Book | null {
    return this.findRowById(id, userId);
  }

  update(id: number, userId: number, changes: BookChanges): Book | null {
    if (!this.findById(id, userId)) {
      return null;
    }

    const assignments: string[] = [];
    const params: Array<string | number | null> = [];

    if (changes.title !== undefined) {
      assignments.push('title = ?');
      params.push(changes.title);
    }
    if (changes.isbn !== undefined) {
      assignments.push('isbn = ?');
      params.push(changes.isbn);
    }
    if (changes.publishedYear !== undefined) {
      assignments.push('published_year = ?');
      params.push(changes.publishedYear);
    }
    if (changes.available !== undefined) {
      assignments.push('available = ?');
      params.push(changes.available ? 1 : 0);
    }

    if (assignments.length === 0) {
      return this.findById(id, userId);
    }

    params.push(id, userId);
    // Solo se interpolan nombres de columna fijos; los valores van siempre en params
    this.db
      .prepare(
        `UPDATE books SET ${assignments.join(', ')} WHERE id = ? AND user_id = ?`,
      )
      .run(...params);

    return this.findById(id, userId);
  }

  delete(id: number, userId: number): boolean {
    const result = this.db
      .prepare('DELETE FROM books WHERE id = ? AND user_id = ?')
      .run(id, userId);
    return result.changes > 0;
  }

  private findRowById(id: number, userId?: number): Book | null {
    const row =
      userId === undefined
        ? (this.db.prepare('SELECT * FROM books WHERE id = ?').get(id) as
            BookRow | undefined)
        : (this.db
            .prepare('SELECT * FROM books WHERE id = ? AND user_id = ?')
            .get(id, userId) as BookRow | undefined);

    return row ? this.toBook(row) : null;
  }

  private toBook(row: BookRow): Book {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      isbn: row.isbn,
      publishedYear: row.published_year,
      available: row.available === 1,
      createdAt: row.created_at,
    };
  }
}
