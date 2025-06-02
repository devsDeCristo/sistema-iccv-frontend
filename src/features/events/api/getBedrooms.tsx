import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { Bedroom } from '../types';
import { GET_BEDROOMS } from '../constants';
import { handleResponseThrowError } from '../../../utils/service';

interface GetBedroomsParams {
  eventId: string;
  bedroomId?: string;
}

const getBedrooms = ({ eventId, bedroomId }: GetBedroomsParams) => {
  const urlWithId = bedroomId ? `/${bedroomId}` : '';

  return apiClient
    .get<Bedroom[]>(`/events/${eventId}/bedrooms${urlWithId}`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetBedroomsData = Awaited<ReturnType<typeof getBedrooms>>;

export const useGetBedrooms = (
  params: GetBedroomsParams,
  options: Omit<
    UseQueryOptions<GetBedroomsData, unknown, GetBedroomsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_BEDROOMS], () => getBedrooms(params), options);
};
