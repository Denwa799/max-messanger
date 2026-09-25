export const logError = (error?: unknown, message?: string): void => {
  if (message) console.error(message);
  if (error) console.error(error);
};
