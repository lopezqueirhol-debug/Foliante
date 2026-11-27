const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export function validateEmail(email: string): Error | null {
  const normalizedEmail = email.trim();

  return EMAIL_REGEX.test(normalizedEmail)
    ? null
    : new Error('El correo electronico no es valido.');
}

export function validatePassword(password: string): Error | null {
  const valid =
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH;

  return valid
    ? null
    : new Error(
        `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres.`,
      );
}
