import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { Insights } from '../types';
import {GET_INSIGHTS_USERS } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';

const getInsightsUsers = () => {
  return apiClient
    .get<Insights>('/users/insights')
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetInsightsUsersData = Awaited<ReturnType<typeof getInsightsUsers>>;

export const useGetInsightsUsers = (
  options: Omit<
    UseQueryOptions<GetInsightsUsersData, unknown, GetInsightsUsersData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_INSIGHTS_USERS], () => getInsightsUsers(), options);
};
