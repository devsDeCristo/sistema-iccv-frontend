import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';

type RemoveUserFromEventProps = {
  idEvent: string;
  idUser: string;
};

const removeUserFromEvent = ({ idEvent, idUser }: RemoveUserFromEventProps) =>
  apiClient
    .delete<boolean>(`/events/${idEvent}/users/${idUser}`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Usuário removido com sucesso!')();
    })
    .catch(handleResponseThrowError());

type RemoveUserFromEventData = Awaited<ReturnType<typeof removeUserFromEvent>>;

export const useRemoveUserFromEvent = ({
  onSuccess,
  ...options
}: MutationOptions<
  RemoveUserFromEventData,
  unknown,
  RemoveUserFromEventProps
> = {}) => {
  return useMutation({
    mutationFn: removeUserFromEvent,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
