import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';

type PutUserParams = {
  userId: string;
  data: any;
};

const putUser = ({ userId, data }: PutUserParams) =>
  apiClient
    .put<boolean>(`/users/${userId}`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Edição efetuada com sucesso')();
    })
    .catch(handleResponseThrowError());

type PutUserData = Awaited<ReturnType<typeof putUser>>;

export const usePutUser = ({
  onSuccess,
  ...options
}: MutationOptions<PutUserData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: (params: PutUserParams) => putUser(params),
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
