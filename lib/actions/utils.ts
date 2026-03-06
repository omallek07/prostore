import { formatError } from '../utils';

export const defaultErrorRes = (error: unknown) => ({
  success: false,
  message: formatError(error),
});

export const defaultSuccessRes = (successMsg: string) => ({
  success: true,
  message: successMsg,
});
