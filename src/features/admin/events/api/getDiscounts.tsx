import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_DISCOUNTS } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';
import { discountsResponse } from '../../../../types/user';


const getDiscounts = () => { 
  return apiClient
    .get<discountsResponse[]>(`/discounts`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetDiscountsData = Awaited<ReturnType<typeof getDiscounts>>;

export const useGetDiscounts = (
  options: Omit<
    UseQueryOptions<GetDiscountsData, unknown, GetDiscountsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery<GetDiscountsData>([GET_DISCOUNTS], () => getDiscounts(), options);
};
