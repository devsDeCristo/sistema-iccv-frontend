import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { Transport } from '../types';
import { GET_TRANSPORTS } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';

interface GetTransportsParams {
  eventId: string;
  transportId?: string;
}

const getTransports = ({ eventId, transportId }: GetTransportsParams) => {
  const urlWithId = transportId ? `/${transportId}` : '';

  return apiClient
    .get<Transport[]>(`/events/${eventId}/transport${urlWithId}`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetTransportsData = Awaited<ReturnType<typeof getTransports>>;

export const useGetTransports = (
  params: GetTransportsParams,
  options: Omit<
    UseQueryOptions<GetTransportsData, unknown, GetTransportsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery(
    [GET_TRANSPORTS, params],
    () => getTransports(params),
    options
  );
};
