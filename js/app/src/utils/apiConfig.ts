const isDevelopment = process.env.NODE_ENV === 'development';

export const getApiBaseUrl = (): string => {
  return isDevelopment ? 'http://localhost:18888/api' : '/api';
};