import { AxiosError } from 'axios';
import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PostCreateCheckoutEventProps = {
  eventId: string;
  userId: string;
  /**
   * `roleId`: ingressos, pela regra de inscrição. `paymentIds`: compras
   * avulsas de produto, que não têm regra.
   */
  data: { roleId?: string[]; paymentIds?: string[] };
  /**
   * Igreja sem cobrança online (503) não é falha para quem acabou de se
   * inscrever: a inscrição foi feita, e o valor é acertado fora do sistema.
   * Nesse fluxo a tela só volta para o evento — "contate o suporte" assusta
   * quem não tem nada a resolver.
   *
   * Onde a pessoa clicou para pagar (o modal de pagamentos, a loja avulsa) o
   * aviso continua: ali o silêncio seria um botão que não faz nada.
   */
  silenciarSemCobranca?: boolean;
};

const postCreateCheckoutEvent = ({
  data,
  eventId,
  userId,
  silenciarSemCobranca,
}: PostCreateCheckoutEventProps) =>
  apiClient
    .post<boolean>(`/events/${eventId}/users/${userId}/payments`, {
      roleRegistrationId: data.roleId ?? [],
      paymentIds: data.paymentIds ?? [],
    })
    .then((response) => {
      handleResponseSuccess(response.data, 'Sala de pagamento criada com sucesso!')();
      return response.data;
    })
    .catch((error: AxiosError<any>) => {
      const semCobrancaOnline = error.response?.status === 503;

      return handleResponseThrowError(
        undefined,
        !(silenciarSemCobranca && semCobrancaOnline)
      )(error);
    });

type PostCreateCheckoutEventData = Awaited<ReturnType<typeof postCreateCheckoutEvent>>;

export const usePostCreateCheckoutEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateCheckoutEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateCheckoutEvent,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
