import type { APIGatewayProxyResultV2 } from 'aws-lambda';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Idempotency-Key,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
};

export function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function parseBody<T>(rawBody: string | undefined): T {
  if (!rawBody) throw new HttpError(400, 'Request body is required.');
  try {
    return JSON.parse(rawBody) as T;
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

export function handleError(error: unknown): APIGatewayProxyResultV2 {
  if (error instanceof HttpError) {
    return json(error.statusCode, { message: error.message });
  }
  // Never leak internal error details (stack traces, SDK internals) to clients.
  console.error(error);
  return json(500, { message: 'Something went wrong. Please try again.' });
}
