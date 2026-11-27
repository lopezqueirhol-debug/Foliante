import Chart from 'chart.js/auto';
import { apiRequest } from '../api/client';
import { clearToken } from '../auth/session';
import { el } from '../ui/dom';

interface Book {
  id: number;
  title: string;
  isbn: string;
  publishedYear: number | null;
  available: boolean;
  finishedAt: string | null;
}

interface FinishedByMonth {
  month: string;
  count: number;
}

type BookPayload = {
  title: string;
  isbn: string;
  publishedYear: number | null;
};

const MONTH_NAMES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-');
  const name = MONTH_NAMES[Number(monthNumber) - 1];

  if (!year || !name) {
    return month;
  }

  return `${name} ${year}`;
}

function todayAsIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function renderBooksView(root: HTMLElement, onLogout: () => void): void {
  root.replaceChildren();

  let editingId: number | null = null;
  let chart: Chart | null = null;

  const message = el('p', { role: 'alert' });
  const list = el('ul');

  const chartMessage = el('p', { class: 'chart-empty' });
  const chartContainer = el('div', { class: 'chart-container' });
  const chartSection = el(
    'section',
    {},
    el('h2', {}, 'Libros terminados por mes'),
    chartMessage,
    chartContainer,
  );

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
      const markButton = el(
        'button',
        { type: 'button' },
        'Marcar como terminado',
      );
      markButton.hidden = book.finishedAt !== null;

      const finishedText =
        book.finishedAt === null ? '' : `Terminado el ${book.finishedAt} `;

      editButton.addEventListener('click', () => startEditing(book));
      deleteButton.addEventListener('click', () => void removeBook(book.id));
      markButton.addEventListener('click', () => void markAsFinished(book.id));

      list.append(
        el(
          'li',
          {},
          `${book.title} (ISBN ${book.isbn}) `,
          finishedText,
          markButton,
          editButton,
          deleteButton,
        ),
      );
    }
  }

  async function loadStats(): Promise<void> {
    const result = await apiRequest<FinishedByMonth[]>(
      '/books/stats/finished-by-month',
    );

    if (!result.ok) {
      if (result.status === 401) {
        onLogout();
        return;
      }
      showErrors(result.errors);
      return;
    }

    if (chart) {
      chart.destroy();
      chart = null;
    }

    chartContainer.replaceChildren();

    if (result.data.length === 0) {
      chartMessage.textContent = 'Todavia no hay libros terminados.';
      return;
    }

    chartMessage.textContent = '';

    const canvas = el('canvas', {});
    chartContainer.append(canvas);

    const styles = getComputedStyle(document.documentElement);
    const accent =
      styles.getPropertyValue('--color-accent').trim() || '#1f4e79';
    const textColor =
      styles.getPropertyValue('--color-text').trim() || '#2b2620';
    const gridColor =
      styles.getPropertyValue('--color-border').trim() || '#e2d9c8';

    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: result.data.map((entry) => formatMonth(entry.month)),
        datasets: [
          {
            label: 'Libros terminados',
            data: result.data.map((entry) => entry.count),
            backgroundColor: accent,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: textColor,
        scales: {
          x: { grid: { color: gridColor } },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: gridColor },
          },
        },
      },
    });
  }

  async function refresh(): Promise<void> {
    await Promise.all([loadBooks(), loadStats()]);
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
    await refresh();
  }

  async function markAsFinished(id: number): Promise<void> {
    const result = await apiRequest(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ finishedAt: todayAsIsoDate() }),
    });

    if (!result.ok) {
      showErrors(result.errors);
      return;
    }

    await refresh();
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
    await refresh();
  });

  cancelButton.addEventListener('click', () => {
    resetForm();
    showErrors([]);
  });

  logoutButton.addEventListener('click', () => {
    chart?.destroy();
    clearToken();
    onLogout();
  });

  root.append(
    el('h1', {}, 'Mis libros'),
    logoutButton,
    form,
    message,
    list,
    chartSection,
  );

  void refresh();
}
