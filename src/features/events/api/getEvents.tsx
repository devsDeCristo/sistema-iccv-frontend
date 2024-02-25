import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { Event } from '../types';
import { GET_EVENTS } from '../constants';

interface GetEventsParams {
  eventId?: string;
}

const getEvents = ({ eventId }: GetEventsParams) => {
  const urlWithId = eventId ? `/${eventId}` : '';

  return apiClient
    .get<Event[] | Event>(`/events${urlWithId}`)
    .then((response) => response.data);
};

type GetEventsData = Awaited<ReturnType<typeof getEvents>>;

export const useGetEvents = (
  params: GetEventsParams,
  options: Omit<
    UseQueryOptions<GetEventsData, unknown, GetEventsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_EVENTS], () => getEvents(params), options);
};
