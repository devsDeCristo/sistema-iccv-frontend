import axios, { InternalAxiosRequestConfig } from 'axios';

import { API_URL } from '../../env';
// import {
//   handleInterceptResponseError,
//   handleInterceptResponseSuccess,
// } from './interceptors';
const token = (): string | null => {
  const result = localStorage.getItem('access_token');
  return result;
};

const apiClient = axios.create({});
apiClient.defaults.baseURL = API_URL;
// apiClient.interceptors.response.use(
//   handleInterceptResponseSuccess,
//   handleInterceptResponseError,
// );
//const apiClient = axios.create({});
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = API_URL;

    if (token()) {
      try {
        const accessToken = token();
        config.baseURL = url;

        if (config.headers) {
          config.headers.set(
            'Authorization',
            accessToken ? `Bearer ${accessToken}` : ''
          );
        }

        return config;
      } catch (error) {
        console.error(error);
      }
    } else {
      localStorage.clear();
      window.location.replace('/login');
    }

    return config; // Retorna o config mesmo em caso de erro para evitar problemas
  }
);

export const setBearerToken = (token: string | null) => {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export { apiClient };
