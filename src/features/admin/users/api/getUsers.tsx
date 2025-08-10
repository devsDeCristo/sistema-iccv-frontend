import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_USERS } from '../constants';
import { User } from '../../../../types/user';

type GetUsersParams = {
  userId?: string;
};

const getUsers = ({ userId }: GetUsersParams) => {
  const urlWithId = userId ? `/${userId}` : '';
  return apiClient
    .get<User[] | User>(`/users${urlWithId}`)
    .then((response) => response.data);
};

type GetUsersData = Awaited<ReturnType<typeof getUsers>>;

export const useGetUsers = (
  params: GetUsersParams,
  options: Omit<
    UseQueryOptions<GetUsersData, unknown, GetUsersData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_USERS], () => getUsers(params), options);
};
