import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { User } from '../types';
import { GET_USERS } from '../constants';

const postUsers = () => {
  return apiClient.post<User[]>('/users').then((response) => response.data);
};

type PostUsersData = Awaited<ReturnType<typeof postUsers>>;

export const usePostUsers = (
  options: Omit<
    UseQueryOptions<PostUsersData, unknown, PostUsersData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_USERS], () => postUsers(), options);
};
