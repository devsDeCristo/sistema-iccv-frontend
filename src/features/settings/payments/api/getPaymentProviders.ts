import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_PAYMENT_PROVIDERS } from '../constants';
import { PaymentProvidersResponse } from '../types';

const getPaymentProviders = (churchId: string) =>
  apiClient
    .get<PaymentProvidersResponse>(`/churches/${churchId}/payment-providers`)
    .then((response) => response.data);

type Data = Awaited<ReturnType<typeof getPaymentProviders>>;

/**
 * A resposta traz as URLs de notificação em claro — elas valem como
 * credencial. Por isso `staleTime` curto e nada de cache agressivo: o que
 * importa aqui é a tela refletir o que está valendo agora, e não economizar
 * uma chamada.
 */
// A chave entra como `string[]` no genérico, como em `getWhatsappStatus`: sem
// declará-la nos dois lados, o tipo inferido da chave não casa com o de
// `UseQueryOptions`, que assume a chave genérica.
type OpcoesIntegracoes = Omit<
  UseQueryOptions<Data, unknown, Data, string[]>,
  'queryKey' | 'queryFn'
>;

export const useGetPaymentProviders = (
  churchId: string | null,
  options: OpcoesIntegracoes = {}
) =>
  useQuery<Data, unknown, Data, string[]>(
    // `?? ''` porque a chave precisa continuar sendo `string[]`; a consulta só
    // roda com igreja escolhida, então o valor vazio nunca chega a ser usado
    [GET_PAYMENT_PROVIDERS, churchId ?? ''],
    () => getPaymentProviders(churchId as string),
    { enabled: !!churchId, ...options }
  );
