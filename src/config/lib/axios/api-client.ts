import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../env';

// ----------------------------
// Token management (cache em memória + persistência)
// ----------------------------
let cachedToken: string | null = localStorage.getItem('access_token');

const getToken = (): string | null => cachedToken;

export const setBearerToken = (token: string | null) => {
  cachedToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('access_token');
    delete apiClient.defaults.headers.common.Authorization;
  }
};

// ----------------------------
// API client instance
// ----------------------------
const apiClient = axios.create({
  baseURL: API_URL,
});

// ----------------------------
// Request Interceptor
// - Adiciona Authorization apenas se houver token
// ----------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Response Interceptor
// - Tratamento global de erro 401
// - Evita redirecionar várias vezes
// ----------------------------
let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      setBearerToken(null); // limpa token (cache + localStorage)
      console.log('Sessão expirada. Faça login novamente.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
