import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { GET_EVENTS } from '../../events/constants';
import { queryClient } from '../../../config/lib/react-query/query-client';

type DeleteRelationEventUserProps = {
  eventId: string;
  userId: string;
};

const deleteRelationEventUser = ({
  eventId,
  userId,
}: DeleteRelationEventUserProps) =>
  apiClient
    .delete<boolean>(`/events/${eventId}/users/${userId}`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Usuário removido com sucesso!')();
    })
    .catch(handleResponseThrowError());

type DeleteRelationEventUserData = Awaited<
  ReturnType<typeof deleteRelationEventUser>
>;

export const useDeleteRelationEventUser = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteRelationEventUserData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: deleteRelationEventUser,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
