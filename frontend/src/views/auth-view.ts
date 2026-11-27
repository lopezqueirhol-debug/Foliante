import { apiRequest } from '../api/client';
import { saveToken } from '../auth/session';
import { el } from '../ui/dom';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function renderAuthView(root: HTMLElement, onLogin: () => void): void {
  root.replaceChildren();

  const message = el('p', { role: 'alert' });
  const title = el('h1', {}, 'Foliante');

  const emailInput = el('input', {
    type: 'email',
    name: 'email',
    required: '',
  });
  const passwordInput = el('input', {
    type: 'password',
    name: 'password',
    required: '',
  });

  const form = el(
    'form',
    {},
    el('label', {}, 'Correo ', emailInput),
    el('label', {}, 'Contraseña ', passwordInput),
    el('button', { type: 'submit' }, 'Entrar'),
  );

  const registerButton = el('button', { type: 'button' }, 'Crear cuenta');

  function showError(errors: string[]): void {
    message.textContent = errors.join(' ');
  }

  function validate(email: string, password: string): string | null {
    if (!email.trim() || !password) {
      return 'Completa el correo y la contraseña.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return 'El correo no tiene un formato valido.';
    }
    return null;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const clientError = validate(email, password);
    if (clientError) {
      showError([clientError]);
      return;
    }

    const result = await apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!result.ok) {
      showError(result.errors);
      return;
    }

    saveToken(result.data.token);
    onLogin();
  });

  registerButton.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const clientError = validate(email, password);
    if (clientError) {
      showError([clientError]);
      return;
    }

    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!result.ok) {
      showError(result.errors);
      return;
    }

    // No se guarda la contraseña: el usuario inicia sesion manualmente.
    passwordInput.value = '';
    showError(['Cuenta creada, inicia sesion.']);
  });

  root.append(title, form, registerButton, message);
}
