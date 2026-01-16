import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';

import { handleResponseThrowError } from '../../../../utils/service';
import { User } from '../../../../types/user';
import { GET_EVENT_USERS_WAITLIST } from '../constants';

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
  return useQuery([GET_EVENT_USERS_WAITLIST, params], () => getUsersWaitlist(params), options);
};
