import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { Insights } from '../types';
import {GET_INSIGHTS } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';

const getInsights = () => {
  return apiClient
    .get<Insights>('/events/insights')
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetInsightsData = Awaited<ReturnType<typeof getInsights>>;

export const useGetInsights = (
  options: Omit<
    UseQueryOptions<GetInsightsData, unknown, GetInsightsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_INSIGHTS], () => getInsights(), options);
};
