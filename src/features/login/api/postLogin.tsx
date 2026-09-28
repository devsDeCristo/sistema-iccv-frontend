import { MutationOptions, useMutation } from 'react-query';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../../../config/env';

const postLogin = (data: any) =>
  axios
    .post<{ access_token: string; user: any }>(`${API_URL}/auth/login`, {
      document: data.document,
      password: data.password,
      captchaToken: data.captchaToken,
    })
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Login efetuado com sucesso',
        false
      )();
      return response.data;
    })
    // bloqueio (429) vira aviso na própria tela, não toast
    .catch((error: AxiosError) =>
      handleResponseThrowError(undefined, error.response?.status !== 429)(error)
    );

type PostLoginData = Awaited<ReturnType<typeof postLogin>>;

export const usePostLogin = ({
  onSuccess,
  ...options
}: MutationOptions<PostLoginData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postLogin,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
