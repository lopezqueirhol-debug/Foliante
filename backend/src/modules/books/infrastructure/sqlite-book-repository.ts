import { DatabaseSync } from 'node:sqlite';
import { NewBook, Book } from '../domain/book';
import { BookChanges, BookRepository } from '../domain/book-repository';

interface BookRow {
  id: number;
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
            INSERT INTO books (title, isbn, published_year, available)
            VALUES (?, ?, ?, ?)    
        `);

    const result = stmt.run(
      newBook.title,
      newBook.isbn,
      newBook.publishedYear,
      newBook.available ? 1 : 0,
    );

    const book = this.findById(Number(result.lastInsertRowid));
    if (!book) {
      throw new Error('No se pudo leer el libro recien creado');
    }
    return book;
  }

  findAll(): Book[] {
    const stmt = this.db.prepare('SELECT * FROM books ORDER BY id ASC');
    const rows = stmt.all() as unknown as BookRow[];

    return rows.map((row) => this.toBook(row));
  }

  findById(id: number): Book | null {
    const stmt = this.db.prepare('SELECT * FROM books WHERE id = ?');
    const row = stmt.get(id) as BookRow | undefined;

    return row ? this.toBook(row) : null;
  }

  update(id: number, changes: BookChanges): Book | null {
    if (!this.findById(id)) {
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
      return this.findById(id);
    }

    params.push(id);
    // Solo se interpolan nombres de columna fijos; los valores van siempre en params
    this.db
      .prepare(`UPDATE books SET ${assignments.join(', ')} WHERE id = ?`)
      .run(...params);

    return this.findById(id);
  }
  delete(id: number): boolean {
    const result = this.db.prepare(`DELETE FROM books WHERE id = ?`).run(id);
    return result.changes > 0;
  }

  private toBook(row: BookRow): Book {
    return {
      id: row.id,
      title: row.title,
      isbn: row.isbn,
      publishedYear: row.published_year,
      available: row.available === 1,
      createdAt: row.created_at,
    };
  }
}
