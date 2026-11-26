import { NewBook } from './book';
import { BookChanges } from './book-repository';

const ISBN_10_REGEX = /^\d{9}[\dXx]$/;
const ISBN_13_REGEX = /^\d{13}$/;
const MIN_YEAR = 1450;

export function validateTitle(title: string): Error | null {
  return title.trim() ? null : new Error('El titulo es obligatorio.');
}

export function validateIsbn(isbn: string): Error | null {
  const compactIsbn = isbn.trim().replaceAll('-', '');
  const valid =
    (compactIsbn.length === 10 && ISBN_10_REGEX.test(compactIsbn)) ||
    (compactIsbn.length === 13 && ISBN_13_REGEX.test(compactIsbn));

  return valid
    ? null
    : new Error('El ISBN debe contener 10 o 13 caracteres sin contar guiones.');
}

export function validatePublishedYear(year: number | null): Error | null {
  if (year === null) {
    return null;
  }
  const maxYear = new Date().getFullYear();
  const valid = Number.isInteger(year) && year >= MIN_YEAR && year <= maxYear;

  return valid
    ? null
    : new Error(`El año debe estar entre ${MIN_YEAR} y ${maxYear}.`);
}

export function validateNewBook(newBook: NewBook): Error[] {
  return [
    validateTitle(newBook.title),
    validateIsbn(newBook.isbn),
    validatePublishedYear(newBook.publishedYear),
  ].filter((error): error is Error => error !== null);
}

export function validateBookChanges(changes: BookChanges): Error[] {
  return [
    changes.title !== undefined ? validateTitle(changes.title) : null,
    changes.isbn !== undefined ? validateIsbn(changes.isbn) : null,
    changes.publishedYear !== undefined
      ? validatePublishedYear(changes.publishedYear)
      : null,
  ].filter((error): error is Error => error !== null);
}

export function duplicateIsbnError(): Error {
  return new Error('El ISBN ya esta registrado en otro libro.');
}
