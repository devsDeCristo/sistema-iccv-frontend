import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

const postCreateUser = (data: any) =>
  apiClient
    .post<{ access_token: string; user: any }>('/users', data)
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Cadastro efetuado com sucesso',
        false
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

type PostCreateUserData = Awaited<ReturnType<typeof postCreateUser>>;

export const usePostCreateUser = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateUserData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateUser,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
