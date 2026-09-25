import { ENV_CONFIG } from '@shared/configs';
import Axios from 'axios';

import { MaxApiError } from './error';

export const maxApiAxios = Axios.create({
  baseURL: ENV_CONFIG.VITE_GREEN_API_MAX_URL,
  adapter: 'fetch',
});

maxApiAxios.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(MaxApiError.from(error)),
);

export * from './error';
