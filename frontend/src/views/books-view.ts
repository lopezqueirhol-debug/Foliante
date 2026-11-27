import { apiRequest } from '../api/client';
import { clearToken } from '../auth/session';
import { el } from '../ui/dom';

interface Book {
  id: number;
  title: string;
  isbn: string;
  publishedYear: number | null;
  available: boolean;
}

type BookPayload = {
  title: string;
  isbn: string;
  publishedYear: number | null;
};

export function renderBooksView(root: HTMLElement, onLogout: () => void): void {
  root.replaceChildren();

  let editingId: number | null = null;

  const message = el('p', { role: 'alert' });
  const list = el('ul');

  const titleInput = el('input', { name: 'title', required: '' });
  const isbnInput = el('input', { name: 'isbn', required: '' });
  const yearInput = el('input', { name: 'publishedYear', type: 'number' });
  const submitButton = el('button', { type: 'submit' }, 'Crear libro');
  const cancelButton = el('button', { type: 'button' }, 'Cancelar edicion');
  cancelButton.hidden = true;

  const form = el(
    'form',
    {},
    el('label', {}, 'Titulo ', titleInput),
    el('label', {}, 'ISBN ', isbnInput),
    el('label', {}, 'Anio de publicacion ', yearInput),
    submitButton,
    cancelButton,
  );

  const logoutButton = el('button', { type: 'button' }, 'Cerrar sesion');

  function showErrors(errors: string[]): void {
    message.textContent = errors.join(' ');
  }

  function resetForm(): void {
    editingId = null;
    form.reset();
    submitButton.textContent = 'Crear libro';
    cancelButton.hidden = true;
  }

  function startEditing(book: Book): void {
    editingId = book.id;
    titleInput.value = book.title;
    isbnInput.value = book.isbn;
    yearInput.value =
      book.publishedYear === null ? '' : String(book.publishedYear);
    submitButton.textContent = 'Guardar';
    cancelButton.hidden = false;
  }

  function buildPayload(): BookPayload {
    const year = yearInput.value.trim();
    return {
      title: titleInput.value.trim(),
      isbn: isbnInput.value.trim(),
      publishedYear: year === '' ? null : Number(year),
    };
  }

  async function loadBooks(): Promise<void> {
    const result = await apiRequest<Book[]>('/books');

    if (!result.ok) {
      if (result.status === 401) {
        onLogout();
        return;
      }
      showErrors(result.errors);
      return;
    }

    list.replaceChildren();
    for (const book of result.data) {
      const editButton = el('button', { type: 'button' }, 'Editar');
      const deleteButton = el('button', { type: 'button' }, 'Borrar');

      editButton.addEventListener('click', () => startEditing(book));
      deleteButton.addEventListener('click', () => void removeBook(book.id));

      list.append(
        el(
          'li',
          {},
          `${book.title} (ISBN ${book.isbn}) `,
          editButton,
          deleteButton,
        ),
      );
    }
  }

  async function removeBook(id: number): Promise<void> {
    const result = await apiRequest(`/books/${id}`, { method: 'DELETE' });

    if (!result.ok) {
      showErrors(result.errors);
      return;
    }

    if (editingId === id) {
      resetForm();
    }
    await loadBooks();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = buildPayload();

    const result =
      editingId === null
        ? await apiRequest('/books', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
        : await apiRequest(`/books/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });

    if (!result.ok) {
      showErrors(result.errors);
      return;
    }

    showErrors([]);
    resetForm();
    await loadBooks();
  });

  cancelButton.addEventListener('click', () => {
    resetForm();
    showErrors([]);
  });

  logoutButton.addEventListener('click', () => {
    clearToken();
    onLogout();
  });

  root.append(el('h1', {}, 'Mis libros'), logoutButton, form, message, list);

  void loadBooks();
}
