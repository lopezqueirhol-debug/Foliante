import { NewBook } from './book';

const ISBN_10_REGEX = /^\d{9}[\dXx]$/;
const ISBN_13_REGEX = /^\d{13}$/;
const MIN_YEAR = 1450;

export function validateNewBook(newBook: NewBook): Array<Error> {
  const errorsList: Array<Error> = [];

  if (!newBook.title.trim()) {
    errorsList.push(new Error('El titulo es obligatorio.'));
  }

  const compactIsbn = newBook.isbn.trim().replaceAll('-', '');
  const validIsbn =
    (compactIsbn.length === 10 && ISBN_10_REGEX.test(compactIsbn)) ||
    (compactIsbn.length === 13 && ISBN_13_REGEX.test(compactIsbn));

  if (!validIsbn) {
    errorsList.push(
      new Error('El ISBN debe contener 10 o 13 caracteres sin contar guiones.'),
    );
  }

  if (newBook.publishedYear !== null) {
    const maxYear = new Date().getFullYear();
    if (
      !Number.isInteger(newBook.publishedYear) ||
      newBook.publishedYear < MIN_YEAR ||
      newBook.publishedYear > maxYear
    ) {
      errorsList.push(
        new Error(`El año debe estar entre ${MIN_YEAR} y ${maxYear}.`),
      );
    }
  }

  return errorsList;
}
