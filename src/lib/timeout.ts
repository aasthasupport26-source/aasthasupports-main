export const withTimeout = <T,>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = "Request timeout"
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};
