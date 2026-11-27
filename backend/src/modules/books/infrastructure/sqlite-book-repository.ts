import type { DatabaseSync } from 'node:sqlite';
import type { Book, FinishedByMonth, NewBook } from '../domain/book';
import type { BookChanges, BookRepository } from '../domain/book-repository';

interface BookRow {
  id: number;
  user_id: number;
  title: string;
  isbn: string;
  published_year: number | null;
  available: number;
  finished_at: string | null;
  created_at: string;
}

interface MonthRow {
  month: string;
  count: number;
}

export class SqliteBookRepository implements BookRepository {
  constructor(private readonly db: DatabaseSync) {}

  create(newBook: NewBook): Book {
    const result = this.db
      .prepare(
        `INSERT INTO books (user_id, title, isbn, published_year, available, finished_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        newBook.userId,
        newBook.title,
        newBook.isbn,
        newBook.publishedYear,
        newBook.available ? 1 : 0,
        newBook.finishedAt,
      );

    const row = this.db
      .prepare('SELECT * FROM books WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as BookRow | undefined;

    if (!row) {
      throw new Error('No se pudo leer el libro recien creado');
    }
    return this.toBook(row);
  }

  findAll(userId: number): Book[] {
    const rows = this.db
      .prepare('SELECT * FROM books WHERE user_id = ? ORDER BY id ASC')
      .all(userId) as unknown as BookRow[];

    return rows.map((row) => this.toBook(row));
  }

  findById(id: number, userId: number): Book | null {
    const row = this.db
      .prepare('SELECT * FROM books WHERE id = ? AND user_id = ?')
      .get(id, userId) as BookRow | undefined;

    return row ? this.toBook(row) : null;
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
    if (changes.finishedAt !== undefined) {
      assignments.push('finished_at = ?');
      params.push(changes.finishedAt);
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

  countFinishedByMonth(userId: number): FinishedByMonth[] {
    const rows = this.db
      .prepare(
        `SELECT substr(finished_at, 1, 7) AS month, COUNT(*) AS count
         FROM books
         WHERE user_id = ? AND finished_at IS NOT NULL
         GROUP BY month
         ORDER BY month ASC`,
      )
      .all(userId) as unknown as MonthRow[];

    return rows.map((row) => ({ month: row.month, count: Number(row.count) }));
  }

  private toBook(row: BookRow): Book {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      isbn: row.isbn,
      publishedYear: row.published_year,
      available: row.available === 1,
      finishedAt: row.finished_at,
      createdAt: row.created_at,
    };
  }
}
