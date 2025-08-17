import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_EVENT_USERS} from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';
import { User } from '../../../../types/user';

interface GetUsersParams {
  eventId: string;
}

const getUsers = ({ eventId }: GetUsersParams) => {

  return apiClient
    .get<User[]>(`/events/${eventId}/users`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetUsersData = Awaited<ReturnType<typeof getUsers>>;

export const useGetUsers = (
  params: GetUsersParams,
  options: Omit<
    UseQueryOptions<GetUsersData, unknown, GetUsersData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_EVENT_USERS, params], () => getUsers(params), options);
};
