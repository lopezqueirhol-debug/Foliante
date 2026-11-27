import { getToken } from './auth/session';
import { renderAuthView } from './views/auth-view';
import { renderBooksView } from './views/books-view';

const root = document.getElementById('app');

if (!root) {
  throw new Error('No se encontro el elemento #app.');
}

function showAuth(): void {
  renderAuthView(root!, showBooks);
}

function showBooks(): void {
  renderBooksView(root!, showAuth);
}

if (getToken()) {
  showBooks();
} else {
  showAuth();
}
