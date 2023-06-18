import axios from 'axios';

import { API_URL } from '../../env';
// import {
//   handleInterceptResponseError,
//   handleInterceptResponseSuccess,
// } from './interceptors';

const apiClient = axios;
apiClient.defaults.baseURL = API_URL;
// apiClient.interceptors.response.use(
//   handleInterceptResponseSuccess,
//   handleInterceptResponseError,
// );

export const setBearerToken = (token: string) => {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export { apiClient };
