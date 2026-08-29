import { MutationOptions, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_ADMIN } from '../constants';

interface ResendNewsResult {
  enviados: number;
  falhas: number;
  /** grupos marcados que ficaram sem link preenchido */
  semLink: number;
}

/** Manda a notícia de novo para todos os grupos marcados, com o texto atual */
const resendNews = (id: string) =>
  apiClient
    .post<ResendNewsResult>(`/news/${id}/whatsapp`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useResendNews = ({
  onSuccess,
  ...options
}: MutationOptions<ResendNewsResult, unknown, string> = {}) =>
  useMutation({
    mutationFn: resendNews,
    onSuccess: (resultado, ...resto) => {
      queryClient.invalidateQueries(GET_NEWS_ADMIN);

      // o reenvio pode terminar sem sair nada (grupo sem link, WhatsApp fora do
      // ar) — dizer só "enviado" nesses casos seria mentira
      if (resultado.enviados) {
        toast.success(
          `Reenviado para ${resultado.enviados} grupo(s) no WhatsApp.`
        );
      } else if (resultado.falhas) {
        toast.error('Nenhum envio concluído. Veja o motivo na lista.');
      } else if (resultado.semLink) {
        toast.warn('Os grupos marcados estão sem link de WhatsApp.');
      } else {
        toast.info('A notícia não tem grupo marcado para envio.');
      }

      onSuccess?.(resultado, ...resto);
    },
    ...options,
  });
