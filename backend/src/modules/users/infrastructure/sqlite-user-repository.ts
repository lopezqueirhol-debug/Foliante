import { DatabaseSync } from 'node:sqlite';
import { NewUser, User } from '../domain/user';
import { UserRepository } from '../domain/user-repository';

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export class SqliteUserRepository implements UserRepository {
  constructor(private readonly db: DatabaseSync) {}

  create(newUser: NewUser): User {
    const stmt = this.db.prepare(`
            INSERT INTO users (email, password_hash)
            VALUES (?, ?)
        `);

    const result = stmt.run(
      newUser.email.trim().toLowerCase(),
      newUser.passwordHash,
    );

    const user = this.findById(Number(result.lastInsertRowid));
    if (!user) {
      throw new Error('No se pudo leer el usuario recien creado');
    }
    return user;
  }

  findByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email.trim().toLowerCase()) as UserRow | undefined;

    return row ? this.toUser(row) : null;
  }

  findById(id: number): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as UserRow | undefined;

    return row ? this.toUser(row) : null;
  }

  private toUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
    };
  }
}
