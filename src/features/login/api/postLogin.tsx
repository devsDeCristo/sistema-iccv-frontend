import { MutationOptions, useMutation } from 'react-query';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import axios from 'axios';
import { API_URL } from '../../../config/env';

const postLogin = (data: any) =>
  axios
    .post<{ access_token: string; user: any }>(`${API_URL}/auth/login`, {
      document: data.document,
      password: data.password,
    })
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Login efetuado com sucesso',
        false
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

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
