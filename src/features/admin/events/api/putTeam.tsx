import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_TEAMS } from '../constants';

type PutTeamProps = {
  eventId: string;
  teamId: string;
  data: any;
};

const putTeam = ({ data, eventId, teamId }: PutTeamProps) =>
  apiClient
    .put<boolean>(`/events/${eventId}/teams/${teamId}`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Time editado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PutTeamData = Awaited<ReturnType<typeof putTeam>>;

export const usePutTeam = ({
  onSuccess,
  ...options
}: MutationOptions<PutTeamData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: putTeam,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_TEAMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
