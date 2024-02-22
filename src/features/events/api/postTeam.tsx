import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_TEAMS } from '../constants';

type PostCreateTeamProps = {
  eventId: string;
  data: any;
};

const postCreateTeam = ({ data, eventId }: PostCreateTeamProps) =>
  apiClient
    .post<boolean>(`/events/${eventId}/teams`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Time criado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PostCreateTeamData = Awaited<ReturnType<typeof postCreateTeam>>;

export const usePostCreateTeam = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateTeamData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateTeam,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_TEAMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
