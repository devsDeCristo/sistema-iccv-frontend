import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../env';
import { endSession, hasSession } from '../../../auth/session';

const token = (): string | null => localStorage.getItem('access_token');

/**
 * As rotas de validação também respondem 401, mas quem decide o que fazer com
 * elas é o loader: `/auth/admin/validate` usa o mesmo 401 para "token vencido"
 * e para "não é admin", e o segundo caso não é motivo para deslogar ninguém.
 */
const VALIDATE_PATHS = ['/auth/validate', '/auth/admin/validate'];

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = token();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 401 em qualquer chamada autenticada significa sessão vencida — o token dura
 * 24h e não existe refresh. Antes disso só os loaders de rota derrubavam a
 * sessão, então quem estava com a tela aberta ficava preso nela colecionando
 * toast de erro até navegar para outra rota.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const decidedByLoader = VALIDATE_PATHS.some((path) => url.includes(path));

    // sem token não há sessão para encerrar: o 401 aí é resposta de negócio
    // (credencial errada, ticket vencido) e quem trata é a própria tela
    if (status === 401 && hasSession() && !decidedByLoader) {
      endSession();
    }

    return Promise.reject(error);
  }
);

export const setBearerToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

export { apiClient };
