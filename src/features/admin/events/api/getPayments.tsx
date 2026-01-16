import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_PAYMENTS_EVENT} from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';
import { PaymentResponse } from '../../../../types/user';

interface GetPaymentsParams {
  eventId: string;
}

const getPayments = ({ eventId }: GetPaymentsParams) => { 
  return apiClient
    .get<PaymentResponse[]>(`/events/${eventId}/payments`)
    .then((response) => response.data)
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
  return useQuery<GetPaymentsData>([GET_PAYMENTS_EVENT, params], () => getPayments(params), options);
};
