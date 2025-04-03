import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';

const postCreateRelationEventUser = (data: any) =>
  apiClient
    .post<boolean>(`/users/${data.idUser}/event/${data.idEvent}`)
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Cadastro efetuado com sucesso',
        false
      )();
    })
    .catch(handleResponseThrowError());

type PostCreateRelationEventUserData = Awaited<
  ReturnType<typeof postCreateRelationEventUser>
>;

export const usePostCreRelationEventateUser = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateRelationEventUserData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateRelationEventUser,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
