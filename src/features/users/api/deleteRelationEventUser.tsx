import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
// import { queryClient } from '../../../config/lib/react-query/query-client';
// import { GET_TEAMS } from '../../events/constants';

type DeleteRelationEventUserProps = {
  eventId: string;
};

const deleteRelationEventUser = ({ eventId }: DeleteRelationEventUserProps) =>
  apiClient
    .delete<boolean>(`/events/${eventId}`)
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
      //queryClient.invalidateQueries(GET_TEAMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
