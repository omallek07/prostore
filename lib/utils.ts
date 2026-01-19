import { clsx, type ClassValue } from 'clsx';
import * as z from 'zod';

import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if (error.name === 'ZodError') {
    const flattenedError = z.flattenError(error);
    const fieldErrors = Object.values(flattenedError.fieldErrors);
    return fieldErrors.flat().join('. ') + '.';
  }

  // Prisma unique constraint violation error
  if (error?.code === 'P2002') {
    return 'This email already exists. Please use a different email.';
  }

  return 'An unexpected error occurred. Please try again.';
}
