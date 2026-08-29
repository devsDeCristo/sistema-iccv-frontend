import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_WHATSAPP_GROUPS } from '../constants';
import { WhatsappTargetGroup } from '../types';

/**
 * Grupos que podem receber disparo: os que têm link, de eventos ativos ou em
 * teste. Evento encerrado não entra na lista.
 */
const getWhatsappGroups = () =>
  apiClient
    .get<WhatsappTargetGroup[]>('/news/whatsapp-groups')
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type GetWhatsappGroupsData = Awaited<ReturnType<typeof getWhatsappGroups>>;

export const useGetNewsWhatsappGroups = (
  options: Omit<
    UseQueryOptions<GetWhatsappGroupsData, unknown, GetWhatsappGroupsData>,
    'queryKey' | 'queryFn'
  > = {}
) => useQuery([GET_NEWS_WHATSAPP_GROUPS], getWhatsappGroups, options);
