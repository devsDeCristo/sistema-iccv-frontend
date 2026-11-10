import {
  MutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { handleResponseThrowError } from '../../../utils/service';
import { PaymentProviderKey } from '../../settings/payments/types';

const GET_PIX_CHECKOUT = 'GET_PIX_CHECKOUT';

interface PixCheckoutParams {
  eventId: string;
  userId: string;
  referenceId: string;
}

/** O que a tela do QR mostra, como o backend devolve */
export interface PixCheckout {
  provider: PaymentProviderKey;
  providerLabel: string;
  eventName: string;
  amountCents: number | null;
  /** O copia e cola — o QR é desenhado a partir do mesmo texto */
  code: string;
  expiresAt: string;
  status: string;
  /** `false` quando um pagamento novo tomou o lugar deste */
  active: boolean;
}

const rota = ({ eventId, userId, referenceId }: PixCheckoutParams) =>
  `/events/${eventId}/users/${userId}/payments/pix/${referenceId}`;

/**
 * Sem toast de erro: a tela consulta isto a cada poucos segundos, e uma falha
 * de rede viraria uma pilha de avisos vermelhos. O 404 tem tela própria.
 */
const getPixCheckout = (params: PixCheckoutParams) =>
  apiClient.get<PixCheckout>(rota(params)).then((response) => response.data);

export const useGetPixCheckout = (
  params: PixCheckoutParams,
  options: Omit<
    UseQueryOptions<PixCheckout, unknown, PixCheckout>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery([GET_PIX_CHECKOUT, params], () => getPixCheckout(params), options);

/** "Já paguei": o servidor pergunta ao gateway agora e devolve a tela atualizada */
const postConferirPix = (params: PixCheckoutParams) =>
  apiClient
    .post<PixCheckout>(`${rota(params)}/check`)
    .then((response) => {
      queryClient.setQueryData([GET_PIX_CHECKOUT, params], response.data);
      return response.data;
    })
    .catch(handleResponseThrowError());

export const usePostConferirPix = (
  options: MutationOptions<PixCheckout, unknown, PixCheckoutParams> = {}
) => useMutation({ mutationFn: postConferirPix, ...options });
