import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../domain/password-hasher';

const SALT_ROUNDS = 10;
export class BcryptPasswordHasher implements PasswordHasher {
  // Hash ficticio: iguala el tiempo de respuesta cuando el usuario no existe
  private readonly dummyHash = bcrypt.hashSync(
    'contraseña-ficticia',
    SALT_ROUNDS,
  );

  hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async compare(
    plainPassword: string,
    passwordHash: string | null,
  ): Promise<boolean> {
    if (passwordHash === null) {
      await bcrypt.compare(plainPassword, this.dummyHash);
      return false;
    }
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
