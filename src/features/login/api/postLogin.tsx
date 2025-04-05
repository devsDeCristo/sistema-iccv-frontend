import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';

const postLogin = (data: any) =>
  apiClient
    .post<{ access_token: string; user: any }>('/auth/login', {
      document: data.document,
      password: data.document,
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
