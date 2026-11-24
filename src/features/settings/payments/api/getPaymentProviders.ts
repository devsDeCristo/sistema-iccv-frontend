import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  GET_PAYMENT_PROVIDERS,
  GET_WEBHOOK_DRAFT,
  PROVIDER_SLUG,
} from '../constants';
import {
  PaymentProviderKey,
  PaymentProvidersResponse,
  WebhookDraft,
} from '../types';

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

const getWebhookDraft = (churchId: string, provider: PaymentProviderKey) =>
  apiClient
    .post<WebhookDraft>(
      `/churches/${churchId}/payment-providers/${PROVIDER_SLUG[provider]}/webhook-draft`
    )
    .then((response) => response.data);

/**
 * A URL de notificação antes do primeiro salvar: o painel do gateway pede a
 * URL para só então mostrar a assinatura que este formulário pede.
 *
 * Fica em cache pela sessão inteira: fechar e reabrir o formulário não pode
 * trocar a URL que a pessoa acabou de colar no painel.
 */
export const useWebhookDraft = (
  churchId: string,
  provider: PaymentProviderKey | undefined,
  enabled: boolean
) =>
  useQuery(
    [GET_WEBHOOK_DRAFT, churchId, provider ?? ''],
    () => getWebhookDraft(churchId, provider as PaymentProviderKey),
    { enabled: enabled && !!provider, staleTime: Infinity, cacheTime: Infinity }
  );
