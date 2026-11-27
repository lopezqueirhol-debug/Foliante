import { PasswordHasher } from '../domain/password-hasher';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user-repository';
import { validateEmail, validatePassword } from '../domain/user-rules';

export type RegisterUserResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'validation'; errors: Error[] }
  | { ok: false; reason: 'duplicate_email'; errors: Error[] };

export interface RegisterUserInput {
  email: string;
  password: string;
}

export async function registerUser(
  repository: UserRepository,
  hasher: PasswordHasher,
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const errors = [
    validateEmail(input.email),
    validatePassword(input.password),
  ].filter((error): error is Error => error !== null);

  if (errors.length > 0) {
    return { ok: false, reason: 'validation', errors };
  }

  const email = input.email.trim().toLowerCase();

  if (repository.findByEmail(email)) {
    return {
      ok: false,
      reason: 'duplicate_email',
      errors: [new Error('El correo ya esta registrado.')],
    };
  }

  const passwordHash = await hasher.hash(input.password);
  const user = repository.create({ email, passwordHash });

  return { ok: true, user };
}
