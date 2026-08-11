import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../../utils/service';
import {
  GET_CHECKIN_QUEUE,
  GET_CHECKIN_SEARCH,
  GET_CHECKIN_STATS,
} from '../constants';
import { CheckinParticipant, CheckinQueue, CheckinStats } from '../types';

/** As chaves destas consultas são sempre arrays de string */
type QueryOptions<T> = Omit<
  UseQueryOptions<T, unknown, T, string[]>,
  'queryKey' | 'queryFn'
>;

const searchCheckin = (eventId: string, q: string) =>
  apiClient
    .get<CheckinParticipant[]>(`/events/${eventId}/checkin/search`, {
      params: q ? { q } : undefined,
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useSearchCheckin = (
  eventId: string,
  q: string,
  options: QueryOptions<CheckinParticipant[]> = {}
) =>
  useQuery(
    [GET_CHECKIN_SEARCH, eventId, q],
    () => searchCheckin(eventId, q),
    options
  );

const getCheckinQueue = (eventId: string) =>
  apiClient
    .get<CheckinQueue>(`/events/${eventId}/checkin/queue`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useGetCheckinQueue = (
  eventId: string,
  options: QueryOptions<CheckinQueue> = {}
) =>
  useQuery([GET_CHECKIN_QUEUE, eventId], () => getCheckinQueue(eventId), options);

const getCheckinStats = (eventId: string) =>
  apiClient
    .get<CheckinStats>(`/events/${eventId}/checkin/stats`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useGetCheckinStats = (
  eventId: string,
  options: QueryOptions<CheckinStats> = {}
) =>
  useQuery([GET_CHECKIN_STATS, eventId], () => getCheckinStats(eventId), options);
