import { createBook } from '../modules/books/application/create-book';
import type { NewBook } from '../modules/books/domain/book';
import { SqliteBookRepository } from '../modules/books/infrastructure/sqlite-book-repository';
import { registerUser } from '../modules/users/application/register-user';
import type { User } from '../modules/users/domain/user';
import { BcryptPasswordHasher } from '../modules/users/infrastructure/bcrypt-password-hasher';
import { SqliteUserRepository } from '../modules/users/infrastructure/sqlite-user-repository';
import { config } from '../shared/config';
import { initDatabase } from '../shared/database';

const DEMO_PASSWORD = 'clave-demo-1234';

type SeedBook = Omit<NewBook, 'userId' | 'available'>;

interface SeedUser {
  email: string;
  books: SeedBook[];
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'demo1@example.com',
    books: [
      {
        title: 'The C Programming Language',
        isbn: '9780131103627',
        publishedYear: 1988,
        finishedAt: '2026-01-15',
      },
      {
        title: 'Clean Code',
        isbn: '9780132350884',
        publishedYear: 2008,
        finishedAt: '2026-02-10',
      },
      {
        title: 'The Pragmatic Programmer',
        isbn: '9780201616224',
        publishedYear: 1999,
        finishedAt: null,
      },
    ],
  },
  {
    email: 'demo2@example.com',
    books: [
      {
        title: 'Design Patterns',
        isbn: '9780201633610',
        publishedYear: 1994,
        finishedAt: '2026-03-05',
      },
      {
        title: 'Introduction to Algorithms',
        isbn: '9780262033848',
        publishedYear: 2009,
        finishedAt: null,
      },
    ],
  },
];

function normalizeIsbn(isbn: string): string {
  return isbn.trim().replaceAll('-', '');
}

async function main(): Promise<void> {
  const db = initDatabase(config.databasePath);
  const userRepository = new SqliteUserRepository(db);
  const bookRepository = new SqliteBookRepository(db);
  const passwordHasher = new BcryptPasswordHasher();

  let createdUsers = 0;
  let existingUsers = 0;
  let createdBooks = 0;
  let existingBooks = 0;

  try {
    for (const seedUser of SEED_USERS) {
      const existingUser = userRepository.findByEmail(seedUser.email);
      let user: User;

      if (existingUser) {
        user = existingUser;
        existingUsers += 1;
      } else {
        const result = await registerUser(userRepository, passwordHasher, {
          email: seedUser.email,
          password: DEMO_PASSWORD,
        });

        if (!result.ok) {
          const details = result.errors.map((error) => error.message).join(' ');
          throw new Error(`No se pudo crear ${seedUser.email}: ${details}`);
        }

        user = result.user;
        createdUsers += 1;
      }

      const existingIsbns = new Set(
        bookRepository.findAll(user.id).map((book) => normalizeIsbn(book.isbn)),
      );

      for (const seedBook of seedUser.books) {
        if (existingIsbns.has(normalizeIsbn(seedBook.isbn))) {
          existingBooks += 1;
          continue;
        }

        const result = createBook(bookRepository, {
          ...seedBook,
          userId: user.id,
          available: true,
        });

        if (!result.ok) {
          const details = result.errors.map((error) => error.message).join(' ');
          throw new Error(`No se pudo crear ${seedBook.title}: ${details}`);
        }

        existingIsbns.add(normalizeIsbn(seedBook.isbn));
        createdBooks += 1;
      }
    }

    console.log(
      `Seed completado: ${createdUsers} usuarios creados, ${existingUsers} ya existian; ${createdBooks} libros creados, ${existingBooks} ya existian.`,
    );
  } finally {
    db.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`No se pudo ejecutar el seed: ${message}`);
  process.exitCode = 1;
});
