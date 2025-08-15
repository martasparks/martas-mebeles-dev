import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type Jsonish = Record<string, unknown>;

function toPublicMessage(error: unknown): string {
  if (error instanceof ZodError) return 'Nekorekti ievades dati.';
  if (error instanceof Error) return error.message;
  return 'Nezināma kļūda';
}

export function handleApiError(error: unknown, status?: number) {
  const httpStatus = status ?? (error instanceof ZodError ? 400 : 500);

  if (process.env.NODE_ENV !== 'test') {
    console.error('[API ERROR]', error);
  }

  const body: Jsonish = {
    error: toPublicMessage(error),
    ...(error instanceof ZodError
      ? { issues: error.issues }
      : process.env.NODE_ENV === 'development'
      ? { detail: String((error as Error)?.stack || error) }
      : {}),
  };

  return NextResponse.json(body, { status: httpStatus });
}