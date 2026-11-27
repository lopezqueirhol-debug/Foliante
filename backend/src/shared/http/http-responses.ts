export type ErrorBody = {
  errors: string[];
};

export type HttpResponse<T> = {
  status: number;
  body: T;
};

export function createdResponse<T>(data: T): HttpResponse<T> {
  return { status: 201, body: data };
}

export function okResponse<T>(data: T): HttpResponse<T> {
  return { status: 200, body: data };
}

export function noContentResponse(): HttpResponse<null> {
  return { status: 204, body: null };
}

export function errorResponse(
  status: number,
  errors: string[],
): HttpResponse<ErrorBody> {
  return { status, body: { errors } };
}
