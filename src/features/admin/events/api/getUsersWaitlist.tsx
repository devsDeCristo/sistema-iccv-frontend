import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_EVENT_USERS} from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';
import { User } from '../../../../types/user';

interface GetUsersParams {
  eventId: string;
}

const getUsersWaitlist = ({ eventId }: GetUsersParams) => {

  return apiClient
    .get<User[]>(`/events/${eventId}/waitlist/users`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetUsersWaitlistData = Awaited<ReturnType<typeof getUsersWaitlist>>;

export const useGetUsersWaitlist = (
  params: GetUsersParams,
  options: Omit<
    UseQueryOptions<GetUsersWaitlistData, unknown, GetUsersWaitlistData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_EVENT_USERS, params], () => getUsersWaitlist(params), options);
};
