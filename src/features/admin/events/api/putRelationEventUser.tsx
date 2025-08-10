import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PutEditRelationEventUserProps = {
  idUser: string;
  idEvent: string;
  worker: boolean;
};

const putEditRelationEventUser = ({
  idUser,
  idEvent,
  worker,
}: PutEditRelationEventUserProps) =>
  apiClient
    .put<boolean>(`/events/${idEvent}/users/${idUser}`, {
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

type PutEditRelationEventUserData = Awaited<
  ReturnType<typeof putEditRelationEventUser>
>;

export const usePutEditRelationEventToUser = ({
  onSuccess,
  ...options
}: MutationOptions<
  PutEditRelationEventUserData,
  unknown,
  PutEditRelationEventUserProps
> = {}) => {
  return useMutation({
    mutationFn: putEditRelationEventUser,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
