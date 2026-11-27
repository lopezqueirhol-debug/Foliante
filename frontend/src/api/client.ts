import { clearToken, getToken } from '../auth/session';

export const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor.';
export const SESSION_EXPIRED_MESSAGE =
  'La sesion ha expirado. Inicia sesion de nuevo.';

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; errors: string[] };

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    return { ok: false, status: 0, errors: [NETWORK_ERROR_MESSAGE] };
  }

  if (response.status === 204) {
    return { ok: true, status: 204, data: undefined as T };
  }

  const body = await response.json().catch(() => null);

  // Solo se limpia la sesion si la peticion iba autenticada.
  // Un 401 de login llega sin token y no debe borrar nada.
  if (response.status === 401 && token) {
    clearToken();
    return { ok: false, status: 401, errors: [SESSION_EXPIRED_MESSAGE] };
  }

  if (!response.ok) {
    const errors: string[] = body?.errors ?? ['Error inesperado.'];
    return { ok: false, status: response.status, errors };
  }

  return { ok: true, status: response.status, data: body as T };
}
