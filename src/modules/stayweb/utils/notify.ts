import { toast } from 'sonner@2.0.3';

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: string }).message;
    if (maybeMessage) return maybeMessage;
    const maybeError = (error as { error?: string }).error;
    if (maybeError) return maybeError;
  }
  return fallback;
};

export const notifyError = (error: unknown, fallback?: string) => {
  const message = getErrorMessage(error, fallback);
  toast.error(message);
  return message;
};

export const notifySuccess = (message: string, opts?: { description?: string }) => {
  toast.success(message, opts);
};