import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { Team } from '../types';
import { GET_TEAMS } from '../constants';
import { handleResponseThrowError } from '../../../utils/service';

interface GetTeamsParams {
  eventId: string;
  teamId?: string;
}

const getTeams = ({ eventId, teamId }: GetTeamsParams) => {
  const urlWithId = teamId ? `/${teamId}` : '';

  return apiClient
    .get<Team[]>(`/events/${eventId}/teams${urlWithId}`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetTeamsData = Awaited<ReturnType<typeof getTeams>>;

export const useGetTeams = (
  params: GetTeamsParams,
  options: Omit<
    UseQueryOptions<GetTeamsData, unknown, GetTeamsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_TEAMS], () => getTeams(params), options);
};
