import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../../utils/service';
import { GET_WHATSAPP_STATUS, INTERVALO_ENQUANTO_CONECTA } from '../constants';
import { WhatsappConnection } from '../types';

/**
 * A situação é de **uma** igreja: cada uma pareia o próprio número, e a
 * resposta de uma não diz nada sobre a outra. Por isso o `churchId` entra na
 * chave da consulta — sem ele, trocar de igreja na tela mostraria o QR da
 * anterior até a resposta nova chegar.
 */
const getWhatsappStatus = (churchId: string) =>
  apiClient
    .get<WhatsappConnection>(`/churches/${churchId}/whatsapp/status`)
    .then((response) => response.data)
    // sem toast: a tela consulta em intervalo curto e um erro viraria enxurrada
    .catch(handleResponseThrowError(undefined, false));

type GetWhatsappStatusData = Awaited<ReturnType<typeof getWhatsappStatus>>;

// A chave entra como `string[]` no genérico: sem isso o `refetchInterval` em
// forma de função não casa com o tipo que o react-query infere para a chave.
type OpcoesStatus = Omit<
  UseQueryOptions<
    GetWhatsappStatusData,
    unknown,
    GetWhatsappStatusData,
    string[]
  >,
  'queryKey' | 'queryFn'
>;

export const useGetWhatsappStatus = (
  churchId: string | null,
  options: OpcoesStatus = {}
) =>
  useQuery<GetWhatsappStatusData, unknown, GetWhatsappStatusData, string[]>(
    [GET_WHATSAPP_STATUS, churchId ?? ''],
    () => getWhatsappStatus(churchId as string),
    {
      enabled: !!churchId,
      // enquanto espera a leitura do QR a tela precisa se atualizar sozinha;
      // conectada, uma consulta a cada 30s basta para perceber uma queda
      refetchInterval: (data) =>
        data?.status === 'CONNECTING' ? INTERVALO_ENQUANTO_CONECTA : 30000,
      ...options,
    }
  );
