import type { CreateBookResult } from '../application/create-book';
import type { GetBookByIdResult } from '../application/get-book-by-id';
import type { UpdateBookResult } from '../application/update-book';
import type { DeleteBookResult } from '../application/delete-book';
import {
  errorResponse,
  type ErrorBody,
  type HttpResponse,
} from '../../../shared/http/http-responses';

type AnyBookResult =
  CreateBookResult | GetBookByIdResult | UpdateBookResult | DeleteBookResult;

export type FailureResult = Extract<AnyBookResult, { ok: false }>;

export function failureResponse(
  result: FailureResult,
): HttpResponse<ErrorBody> {
  switch (result.reason) {
    case 'validation':
      return errorResponse(
        400,
        result.errors.map((error) => error.message),
      );
    case 'duplicate_isbn':
      return errorResponse(
        409,
        result.errors.map((error) => error.message),
      );
    case 'not_found':
      return errorResponse(404, ['Libro no encontrado.']);
    default: {
      const unhandled: never = result;
      throw new Error(`Motivo no contemplado: ${JSON.stringify(unhandled)}`);
    }
  }
}
