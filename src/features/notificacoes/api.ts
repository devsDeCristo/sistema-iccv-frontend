import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';

export type TipoDeNotificacao =
  | 'MEMBERSHIP_REQUEST'
  | 'MEMBERSHIP_ANSWERED'
  | 'CHURCH_REQUEST'
  | 'CHURCH_REQUEST_ANSWERED'
  | 'NEWS'
  | 'EVENT';

export interface Notificacao {
  id: string;
  tipo: TipoDeNotificacao;
  /** o que originou; no evento, é o id dele */
  origemId: string;
  titulo: string;
  texto: string;
  churchId: string | null;
  data: string;
  lida: boolean;
}

/** As duas consultas começam com ela: invalidar a chave atualiza as duas */
const NOTIFICACOES = 'NOTIFICACOES';

// ponytail: pergunta a cada 1 min; trocar pelo socket.io (já instalado) se precisar ser na hora
/** Só o número, barato: é o que o sininho pergunta o tempo todo */
export const useNaoLidas = () =>
  useQuery(
    [NOTIFICACOES, 'nao-lidas'],
    () =>
      apiClient
        .get<{ naoLidas: number }>('/notificacoes/nao-lidas')
        .then((response) => response.data.naoLidas),
    // desligado no projeto todo, mas aqui é o que faz a aba que volta do
    // fundo mostrar o número certo
    { refetchInterval: 60_000, refetchOnWindowFocus: true }
  );

/** A lista, só com o sininho aberto */
export const useNotificacoes = (aberto: boolean) =>
  useQuery(
    [NOTIFICACOES, 'lista'],
    () =>
      apiClient
        .get<Notificacao[]>('/notificacoes')
        .then((response) => response.data),
    { enabled: aberto }
  );

/** Uma (o clique na notificação); sem ids, todas as não lidas */
export const useMarcarLidas = () =>
  useMutation(
    (ids?: string[]) => apiClient.post('/notificacoes/lidas', { ids }),
    { onSuccess: () => queryClient.invalidateQueries(NOTIFICACOES) }
  );
