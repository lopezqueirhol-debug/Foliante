import type { CreateBookResult } from '../application/create-book';
import type { GetBookByIdResult } from '../application/get-book-by-id';
import type { UpdateBookResult } from '../application/update-book';
import type { DeleteBookResult } from '../application/delete-book';

export type ErrorBody = {
  errors: string[];
};

export type HttpResponse<T> = {
  status: number;
  body: T;
};

function createdResponse<T>(data: T): HttpResponse<T> {
  return {
    status: 201,
    body: data,
  };
}

function okResponse<T>(data: T): HttpResponse<T> {
  return {
    status: 200,
    body: data,
  };
}

function noContentResponse(): HttpResponse<null> {
  return {
    status: 204,
    body: null,
  };
}

type AnyBookResult =
  CreateBookResult | GetBookByIdResult | UpdateBookResult | DeleteBookResult;

type FailureResult = Extract<AnyBookResult, { ok: false }>;

function failureResponse(result: FailureResult): HttpResponse<ErrorBody> {
  switch (result.reason) {
    case 'validation':
      return {
        status: 400,
        body: { errors: result.errors.map((error) => error.message) },
      };
    case 'duplicate_isbn':
      return {
        status: 409,
        body: { errors: result.errors.map((error) => error.message) },
      };
    case 'not_found':
      return {
        status: 404,
        body: { errors: ['Libro no encontrado.'] },
      };
    default: {
      const unhandle: never = result;
      throw new Error(`Motivo no contemplado: ${JSON.stringify(unhandle)}`);
    }
  }
}
