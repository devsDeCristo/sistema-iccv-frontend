import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {  Group } from '../types';
import {GET_GROUPS_BY_USER } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';

interface GetGroupsByUserParams {
  userId?: string;
}

const getGroupsByUser  = ({ userId }: GetGroupsByUserParams) => {
 
  return apiClient
    .get<Group[]>(`/users/${userId}/groups`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetGroupsByUserData = Awaited<ReturnType<typeof getGroupsByUser>>;

export const useGetGroupsByUser = (
  params: GetGroupsByUserParams,
  options: Omit<
    UseQueryOptions<GetGroupsByUserData, unknown, GetGroupsByUserData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery<GetGroupsByUserData>([GET_GROUPS_BY_USER, params], () => getGroupsByUser(params), options);
};
