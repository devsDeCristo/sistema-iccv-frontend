import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_PAYMENTS_EVENT } from '../constants';

type PostReconcilePaymentsProps = {
  eventId: string;
};

/** O que a rodada fez, como o backend devolve */
type Resumo = {
  conferidas: number;
  atualizadas: number;
};

/**
 * A mensagem conta as três histórias diferentes que a mesma rodada pode ter.
 *
 * "Nada mudou" é resultado, e não falha: quer dizer que o gateway confirmou o
 * que já estava aqui. Sem essa frase, a pessoa clica de novo achando que o
 * botão não funcionou.
 */
function mensagem({ conferidas, atualizadas }: Resumo) {
  if (atualizadas > 0) {
    return atualizadas === 1
      ? '1 cobrança atualizada pelo gateway.'
      : `${atualizadas} cobranças atualizadas pelo gateway.`;
  }

  if (conferidas === 0) {
    return 'Nenhuma cobrança pendente para conferir.';
  }

  return conferidas === 1
    ? 'A cobrança pendente continua como está no gateway.'
    : `As ${conferidas} cobranças pendentes continuam como estão no gateway.`;
}

const postReconcilePayments = ({ eventId }: PostReconcilePaymentsProps) =>
  apiClient
    .post<Resumo>(`/events/${eventId}/payments/reconcile`)
    .then((response) => {
      handleResponseSuccess(response.data, mensagem(response.data))();
      return response.data;
    })
    .catch(handleResponseThrowError());

type PostReconcilePaymentsData = Awaited<
  ReturnType<typeof postReconcilePayments>
>;

export const usePostReconcilePayments = ({
  onSuccess,
  ...options
}: MutationOptions<
  PostReconcilePaymentsData,
  unknown,
  PostReconcilePaymentsProps
> = {}) => {
  return useMutation({
    mutationFn: postReconcilePayments,
    onSuccess: (...args) => {
      // mesma chave da tabela e dos cards de resumo
      queryClient.invalidateQueries(GET_PAYMENTS_EVENT);
      onSuccess?.(...args);
    },
    ...options,
  });
};
