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
};

/**
 * Igreja que não recebe pelo site devolve 503 — módulo desligado ou sem
 * gateway ativo. Não é erro: é como aquela igreja funciona, e o valor se
 * acerta com a organização.
 *
 * Por isso o toast vermelho não sai nesse caso. Quem chamou mostra o aviso em
 * modal, com a frase certa para a tela em que a pessoa está.
 */
const NAO_RECEBE_ONLINE = 503;

const ehPagamentoForaDoSite = (erro: unknown) =>
  (erro as AxiosError)?.response?.status === NAO_RECEBE_ONLINE;

const postCreateCheckoutEvent = ({
  data,
  eventId,
  userId,
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
    .catch((error: AxiosError<any>) =>
      handleResponseThrowError(undefined, !ehPagamentoForaDoSite(error))(error)
    );

type PostCreateCheckoutEventData = Awaited<ReturnType<typeof postCreateCheckoutEvent>>;

export { ehPagamentoForaDoSite };

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
