import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_DASHBOARD } from '../constants';
import { Dashboard } from '../types';

const getDashboard = () =>
  apiClient.get<Dashboard>('/dashboard').then((response) => response.data);

type GetDashboardData = Awaited<ReturnType<typeof getDashboard>>;

export const useGetDashboard = (
  options: Omit<
    UseQueryOptions<GetDashboardData, unknown, GetDashboardData>,
    'queryKey' | 'queryFn'
  > = {}
) => useQuery([GET_DASHBOARD], getDashboard, options);
