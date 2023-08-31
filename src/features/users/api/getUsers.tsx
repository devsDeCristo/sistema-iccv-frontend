import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { User } from '../types';
import { GET_USERS } from '../constants';

const getUsers = () => {
  return apiClient.get<User[]>('/users').then((response) => response.data);
};

type GetUsersData = Awaited<ReturnType<typeof getUsers>>;

export const useGetUsers = (
  options: Omit<
    UseQueryOptions<GetUsersData, unknown, GetUsersData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_USERS], () => getUsers(), options);
};
