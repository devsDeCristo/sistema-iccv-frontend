import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { Event, EventDetails } from '../types';
import { GET_EVENTS } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';

interface GetEventsParams {
  eventId?: string;
  /**
   * Visão do painel: só os eventos da igreja de quem está logado. Sem isto vem
   * o catálogo, que é o que a área do usuário mostra — lá o admin navega e se
   * inscreve como qualquer outro, em evento de qualquer igreja.
   */
  painel?: boolean;
}

const getEvents = ({ eventId, painel }: GetEventsParams) => {
  const urlWithId = eventId ? `/${eventId}` : '';
  const query = painel ? '?painel=true' : '';

  return apiClient
    .get<Event[] | EventDetails>(`/events${urlWithId}${query}`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetEventsData = Awaited<ReturnType<typeof getEvents>>;

export const useGetEvents = (
  params: GetEventsParams,
  options: Omit<
    UseQueryOptions<GetEventsData, unknown, GetEventsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_EVENTS, params], () => getEvents(params), options);
};
