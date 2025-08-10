import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PostCreateRelationEventUserProps = {
  idUser: string;
  idEvent: string;
  worker: boolean;
};

const postCreateRelationEventUser = ({
  idUser,
  idEvent,
  worker,
}: PostCreateRelationEventUserProps) =>
  apiClient
    .post<boolean>(`/users/${idUser}/event/${idEvent}`, {
      worker: worker,
    })
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

export const usePostCreRelationEventToUser = ({
  onSuccess,
  ...options
}: MutationOptions<
  PostCreateRelationEventUserData,
  unknown,
  PostCreateRelationEventUserProps
> = {}) => {
  return useMutation({
    mutationFn: postCreateRelationEventUser,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
