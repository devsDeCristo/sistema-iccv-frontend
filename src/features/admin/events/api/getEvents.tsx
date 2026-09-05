import { QueryClient, UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { Event, EventDetails } from '../types';
import { GET_EVENTS } from '../constants';
import { handleResponseThrowError } from '../../../../utils/service';

interface GetEventsParams {
  eventId?: string;
  /**
   * Pede logo e capa em base64 (`data.logoBase64` / `data.coverBase64`).
   *
   * Só quem gera PDF precisa: o `@react-pdf/renderer` não busca imagem remota.
   * O servidor baixa as duas do Firebase Storage para montar a resposta, o que
   * custa ~1,5s — a tela comum usa `data.logoUrl` / `data.coverUrl`, que o
   * próprio navegador carrega e cacheia.
   */
  embedImages?: boolean;
  /**
   * Visão do painel: só os eventos da igreja de quem está logado. Sem isto vem
   * o catálogo, que é o que a área do usuário mostra — lá o admin navega e se
   * inscreve como qualquer outro, em evento de qualquer igreja.
   */
  painel?: boolean;
}

const getEvents = ({ eventId, embedImages, painel }: GetEventsParams) => {
  const urlWithId = eventId ? `/${eventId}` : '';

  return apiClient
    .get<Event[] | EventDetails>(`/events${urlWithId}`, {
      // os dois convivem: o painel recorta por igreja, o base64 é para o PDF
      params: {
        ...(painel ? { painel: true } : {}),
        ...(embedImages ? { embedImages: true } : {}),
      },
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

/**
 * Busca o evento já com logo e capa em base64, reaproveitando o cache do
 * react-query.
 *
 * Fica fora do `useGetEvents` de propósito: as imagens só servem para gerar
 * PDF, e pedi-las custa ~1,5s porque o servidor precisa baixá-las do Firebase
 * Storage. Chamar isto de dentro do gerador (e não na montagem da tela) faz
 * esse custo cair no loading do próprio PDF, uma vez só.
 */
export const fetchEventWithImages = (
  queryClient: QueryClient,
  eventId: string
) => {
  const params: GetEventsParams = { eventId, embedImages: true };

  return queryClient.fetchQuery([GET_EVENTS, params], () => getEvents(params), {
    // gerar dois PDFs seguidos não deve baixar as imagens duas vezes
    staleTime: 5 * 60 * 1000,
  });
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
