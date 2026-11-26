import { PasswordHasher } from '../domain/password-hasher';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user-repository';
import { validateEmail } from '../domain/user-rules';

export type LoginUserResult =
  | { ok: true; user: User }
  | { ok: false; reason: 'validation'; errors: Error[] }
  | { ok: false; reason: 'invalid_credentials'; errors: Error[] };

export interface LoginUserInput {
  email: string;
  password: string;
}

// Hash ficticio para igualar el tiempo de respuesta cuando el email no existe
const DUMMY_HASH =
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.G8Wz0ZtFQWS0eyTb0DpfOhZ0yO0e';

const INVALID_CREDENTIALS_MESSAGE = 'Credenciales invalidas.';

export async function loginUser(
  repository: UserRepository,
  hasher: PasswordHasher,
  input: LoginUserInput,
): Promise<LoginUserResult> {
  const emailError = validateEmail(input.email);

  if (emailError) {
    return { ok: false, reason: 'validation', errors: [emailError] };
  }

  const email = input.email.trim().toLowerCase();
  const user = repository.findByEmail(email);

  const passwordMatches = await hasher.compare(
    input.password,
    user ? user.passwordHash : DUMMY_HASH,
  );

  if (!user || !passwordMatches) {
    return {
      ok: false,
      reason: 'invalid_credentials',
      errors: [new Error(INVALID_CREDENTIALS_MESSAGE)],
    };
  }

  return { ok: true, user };
}
