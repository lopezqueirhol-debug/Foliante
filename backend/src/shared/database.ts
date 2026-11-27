import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function initDatabase(dbPath: string): DatabaseSync {
  const folderPath = dirname(dbPath);
  mkdirSync(folderPath, { recursive: true });
  const db = new DatabaseSync(dbPath, { timeout: 5000 });
  db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) STRICT;

        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            isbn TEXT NOT NULL,
            published_year INTEGER,
            available INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, isbn)
        ) STRICT;

        CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
    `);
  return db;
}
