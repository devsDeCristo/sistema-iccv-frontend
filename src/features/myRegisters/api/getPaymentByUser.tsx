import { UseQueryOptions, useQuery } from 'react-query';

import { paymentsWithRoles } from '../types';
import { GET_PAYMENTS_USER } from '../constants';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';


interface GetPaymentsParams {
  userId: string;

}
const getPayments = ({userId }: GetPaymentsParams) => {

  return apiClient
    .get<paymentsWithRoles[]>(`/users/${userId}/payments`)
    .then((response:any) => response.data)
    .catch(handleResponseThrowError());
};

type GetPaymentsData = Awaited<ReturnType<typeof getPayments>>;

export const useGetPayments = (
  params: GetPaymentsParams,
  options: Omit<
    UseQueryOptions<GetPaymentsData, unknown, GetPaymentsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_PAYMENTS_USER, params], () => getPayments(params), options);
};
