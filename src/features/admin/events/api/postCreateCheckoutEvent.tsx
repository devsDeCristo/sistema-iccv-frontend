import { AxiosError } from 'axios';
import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import {
  EscolhaDePagamento,
  FormaDePagamento,
  escolherFormaDePagamento,
} from '../../../events/components/escolherFormaDePagamento';

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

/**
 * `link` é para onde o inscrito vai: a página do gateway ou, no Pix do PayPal,
 * a nossa tela do QR. `choice` vem no lugar dele quando o gateway pede que a
 * forma de pagamento seja escolhida antes.
 */
type RespostaDoCheckout = {
  message: string;
  link?: string;
  choice?: EscolhaDePagamento;
};

/** A pessoa fechou a pergunta da forma de pagamento sem escolher */
class EscolhaCancelada extends Error {}

const criarCheckout = (
  { data, eventId, userId }: PostCreateCheckoutEventProps,
  method?: FormaDePagamento
) =>
  apiClient
    .post<RespostaDoCheckout>(`/events/${eventId}/users/${userId}/payments`, {
      roleRegistrationId: data.roleId ?? [],
      paymentIds: data.paymentIds ?? [],
      ...(method ? { method } : {}),
    })
    .then((response) => response.data);

/**
 * A pergunta da forma de pagamento mora aqui, e não em cada tela, porque três
 * lugares abrem checkout (a inscrição, a loja e Minhas Inscrições) e nenhum
 * deles sabe qual gateway a igreja usa. Quem sabe é o servidor: ele responde
 * `choice` quando é preciso escolher, a pergunta é feita e a chamada se repete
 * com a resposta. Nos gateways sem escolha vem o `link` direto, como sempre.
 */
const postCreateCheckoutEvent = async (props: PostCreateCheckoutEventProps) => {
  try {
    let resposta = await criarCheckout(props);

    if (resposta.choice) {
      const forma = await escolherFormaDePagamento(resposta.choice);
      if (!forma) throw new EscolhaCancelada();

      resposta = await criarCheckout(props, forma);
    }

    return handleResponseSuccess(
      resposta,
      'Sala de pagamento criada com sucesso!'
    )();
  } catch (error) {
    // Desistir da pergunta não é falha: sem toast vermelho. Quem chamou trata
    // como qualquer pagamento que ficou para depois.
    if (error instanceof EscolhaCancelada) throw error;

    return handleResponseThrowError(
      undefined,
      !ehPagamentoForaDoSite(error)
    )(error as AxiosError<any>);
  }
};

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
