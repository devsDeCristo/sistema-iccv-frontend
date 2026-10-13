import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { useIgrejaSelecionada } from '../../../settings/shared/useIgrejaSelecionada';
import { useRole } from '../../../../hooks/useRole';
import { GET_CONCILIACAO, GET_LANCAMENTOS } from '../constants';
import {
  ConciliacaoDaTesouraria,
  DetalheDaTesouraria,
  LancamentoDaTesouraria,
  NaoAlocados,
  TesourariaNaLista,
  TipoDaTesouraria,
  TipoDoLancamento,
} from './modelo';

/** O prefixo de todas as consultas daqui: mexeu em uma, recarrega tudo */
export const GET_TESOURARIAS = 'GET_TESOURARIAS';

const rota = (churchId: string) =>
  `/churches/${churchId}/tesouraria/tesourarias`;

/**
 * Tudo das tesourarias se cruza (a lista soma, a conciliação e os lançamentos
 * mostram o mesmo dinheiro); e, sem a divisão dos bancos, o distribuído sai
 * da Administrativa — que também recarrega.
 */
const invalidar = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_TESOURARIAS),
    queryClient.invalidateQueries(GET_LANCAMENTOS),
    queryClient.invalidateQueries(GET_CONCILIACAO),
  ]);

/**
 * De qual igreja é a tesouraria na tela. A equipe da igreja escolhe no
 * seletor do topo; o tesoureiro(a) de evento não escolhe — é a igreja dos
 * eventos em que ele é completo (com Tesouraria no plano).
 *
 * ponytail: o tesoureiro de eventos de mais de uma igreja fica com a
 * primeira; um seletor para ele, quando aparecer o caso.
 */
export function useIgrejaDaTesouraria() {
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const { soTesoureiroDeEvento, eventTreasurers } = useRole();
  const churchId = soTesoureiroDeEvento
    ? (eventTreasurers.find(
        (t) => t.kind === 'COMPLETO' && t.modulos?.includes('TREASURY')
      )?.churchId ?? null)
    : escopo.churchId;
  return { escopo, churchId, soTesoureiroDeEvento };
}

const ler = <T>(url: string, params?: object) =>
  apiClient.get<T>(url, { params }).then((r) => r.data);

export const useTesourarias = (
  churchId: string | null,
  tipo: TipoDaTesouraria
) =>
  useQuery(
    [GET_TESOURARIAS, 'lista', churchId, tipo],
    () => ler<TesourariaNaLista[]>(rota(churchId as string), { tipo }),
    { enabled: !!churchId }
  );

export const useTesouraria = (churchId: string | null, id?: string) =>
  useQuery(
    [GET_TESOURARIAS, 'uma', churchId, id],
    () => ler<DetalheDaTesouraria>(`${rota(churchId as string)}/${id}`),
    { enabled: !!churchId && !!id, retry: false }
  );

export const useConciliacaoDaTesouraria = (
  churchId: string | null,
  id?: string
) =>
  useQuery(
    [GET_TESOURARIAS, 'conciliacao', churchId, id],
    () =>
      ler<ConciliacaoDaTesouraria>(
        `${rota(churchId as string)}/${id}/conciliacao`
      ),
    { enabled: !!churchId && !!id, keepPreviousData: true }
  );

export const useLancamentosDaTesouraria = (
  churchId: string | null,
  id?: string
) =>
  useQuery(
    [GET_TESOURARIAS, 'lancamentos', churchId, id],
    () =>
      ler<LancamentoDaTesouraria[]>(
        `${rota(churchId as string)}/${id}/lancamentos`
      ),
    { enabled: !!churchId && !!id }
  );

export const useNaoAlocados = (
  churchId: string | null,
  tipo: TipoDaTesouraria,
  enabled = true
) =>
  useQuery(
    [GET_TESOURARIAS, 'nao-alocados', churchId, tipo],
    () =>
      ler<NaoAlocados>(`${rota(churchId as string)}/nao-alocados`, { tipo }),
    { enabled: enabled && !!churchId }
  );

/** Uma mutação das tesourarias: o toast de sucesso (se houver) e o recarregar */
function mutacao<T>(
  fazer: (args: T) => Promise<unknown>,
  sucesso?: string | ((args: T) => string)
) {
  return function useMutacao() {
    return useMutation({
      mutationFn: (args: T) =>
        fazer(args)
          .then((resposta) => {
            const texto =
              typeof sucesso === 'function' ? sucesso(args) : sucesso;
            if (texto) handleResponseSuccess(resposta, texto)();
            return resposta;
          })
          .catch(handleResponseThrowError()),
      onSuccess: invalidar,
    });
  };
}

export const useCriarTesouraria = mutacao(
  ({
    churchId,
    ...dados
  }: {
    churchId: string;
    kind: TipoDaTesouraria;
    eventId?: string;
    name?: string;
    date?: string;
    location?: string;
  }) =>
    apiClient
      .post<TesourariaNaLista>(rota(churchId), dados)
      .then((r) => r.data),
  'Tesouraria criada'
);

type DaTesouraria = { churchId: string; id: string };

export const useFecharTesouraria = mutacao(
  ({ churchId, id, fechar }: DaTesouraria & { fechar: boolean }) =>
    fechar
      ? apiClient.post(`${rota(churchId)}/${id}/fechamento`)
      : apiClient.delete(`${rota(churchId)}/${id}/fechamento`),
  ({ fechar }) => (fechar ? 'Tesouraria fechada' : 'Tesouraria reaberta')
);

export const useDistribuir = mutacao(
  ({
    churchId,
    id,
    partes,
  }: DaTesouraria & { partes: { movimentoId: string; valor?: number }[] }) =>
    apiClient.post(`${rota(churchId)}/${id}/alocacoes`, { partes })
);

export const useDevolver = mutacao(
  ({ churchId, id, alocacaoId }: DaTesouraria & { alocacaoId: string }) =>
    apiClient.delete(`${rota(churchId)}/${id}/alocacoes/${alocacaoId}`)
);

export const useClassificar = mutacao(
  ({
    churchId,
    id,
    alocacaoId,
    categoria,
  }: DaTesouraria & { alocacaoId: string; categoria: string | null }) =>
    apiClient.patch(`${rota(churchId)}/${id}/alocacoes/${alocacaoId}`, {
      categoria,
    })
);

export const useConciliarNaTesouraria = mutacao(
  ({
    churchId,
    id,
    movimentoId,
    lancamentoIds,
  }: DaTesouraria & { movimentoId: string; lancamentoIds: string[] }) =>
    apiClient.post(`${rota(churchId)}/${id}/conciliacao`, {
      movimentoId,
      lancamentoIds,
    }),
  'Conciliado'
);

export const useDesfazerNaTesouraria = mutacao(
  ({ churchId, id, movimentoId }: DaTesouraria & { movimentoId: string }) =>
    apiClient.delete(`${rota(churchId)}/${id}/conciliacao/${movimentoId}`),
  'Conciliação desfeita'
);

export const useNaoConsta = mutacao(
  ({
    churchId,
    id,
    lancamentoIds,
    naoConsta,
  }: DaTesouraria & { lancamentoIds: string[]; naoConsta: boolean }) =>
    apiClient.post(`${rota(churchId)}/${id}/nao-consta`, {
      lancamentoIds,
      naoConsta,
    })
);

export const useNovoLancamentoDaTesouraria = mutacao(
  ({
    churchId,
    id,
    ...dados
  }: DaTesouraria & {
    type: TipoDoLancamento;
    category: string;
    description: string;
    amount: number;
    date: string;
    method?: string;
  }) => apiClient.post(`${rota(churchId)}/${id}/lancamentos`, dados),
  'Lançamento criado'
);
