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

// Round number to 2 decimal places
export function round2(value: number | string) {
  const roundFcn = (value: number) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

  if (typeof value === 'number') {
    return roundFcn(value);
  } else if (typeof value === 'string') {
    return roundFcn(Number(value));
  } else {
    throw new Error('Value is not a number or string');
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
});

// Format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === 'number') {
    return CURRENCY_FORMATTER.format(amount);
  }

  if (typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount));
  }

  return 'NaN';
}
