import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';

const postCreateUser = (data: any) =>
  apiClient
    .post<boolean>('/users', data)
    .then((response) => {
      console.log(response);
      handleResponseSuccess(response.data, 'Cadastro efetuado com sucesso')();
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
