import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_TEAMS } from '../constants';

type DeleteTeamProps = {
  eventId: string;
  teamId: string;
};

const deleteTeam = ({ eventId, teamId }: DeleteTeamProps) =>
  apiClient
    .delete<boolean>(`/events/${eventId}/team/${teamId}`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Time removido com sucesso!')();
    })
    .catch(handleResponseThrowError());

type DeleteTeamData = Awaited<ReturnType<typeof deleteTeam>>;

export const useDeleteTeam = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteTeamData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_TEAMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
