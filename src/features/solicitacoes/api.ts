import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../utils/service';
import { LadoDaDecisao, MinhaSolicitacao, SolicitacaoDaIgreja } from './types';

const GET_MINHAS = 'GET_MINHAS_SOLICITACOES';
const GET_DA_IGREJA = 'GET_SOLICITACOES_DA_IGREJA';

export const useMinhasSolicitacoes = () =>
  useQuery(GET_MINHAS, () =>
    apiClient
      .get<MinhaSolicitacao[]>('/solicitacoes/minhas')
      .then((response) => response.data)
  );

/** A igreja é a de que a pessoa é membro: a API decide, a tela não manda */
export const useCriarSolicitacao = () =>
  useMutation({
    mutationFn: (dados: {
      ministerio: string;
      titulo: string;
      descricao: string;
      produtos: { nome: string; quantidade: number; link?: string }[];
    }) =>
      apiClient
        .post('/solicitacoes', dados)
        .then((response) =>
          handleResponseSuccess(response.data, 'Solicitação enviada')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_MINHAS),
  });

export const useSolicitacoesDaIgreja = (churchId: string | null) =>
  useQuery(
    [GET_DA_IGREJA, churchId ?? ''],
    () =>
      apiClient
        .get<SolicitacaoDaIgreja[]>(`/churches/${churchId}/solicitacoes`)
        .then((response) => response.data),
    { enabled: !!churchId, keepPreviousData: true }
  );

/**
 * Como quem está logado decide nesta igreja: pastor, tesouraria ou nenhum
 * (`lado`). `temPastor`: a igreja tem líder espiritual cadastrado — sem ele,
 * nenhuma solicitação é aprovada.
 */
export const usePapelNasSolicitacoes = (churchId: string | null) =>
  useQuery(
    ['GET_PAPEL_NAS_SOLICITACOES', churchId ?? ''],
    () =>
      apiClient
        .get<{
          lado: LadoDaDecisao | null;
          temPastor: boolean;
        }>(`/churches/${churchId}/solicitacoes/papel`)
        .then((response) => response.data),
    { enabled: !!churchId }
  );

/**
 * O que qualquer um do painel muda à mão: a situação de antes da decisão
 * (solicitada ou em análise) e a resposta ao membro.
 */
export const useMudarStatus = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      ...dados
    }: {
      churchId: string;
      id: string;
      status?: 'REQUESTED' | 'IN_REVIEW';
      resposta: string;
    }) =>
      apiClient
        .patch(`/churches/${churchId}/solicitacoes/${id}/status`, dados)
        .then((response) =>
          handleResponseSuccess(response.data, 'Solicitação salva')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_DA_IGREJA),
  });

/** A decisão do pastor ou da tesouraria: o lado a API tira de quem está logado */
export const useDecidir = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      ...dados
    }: {
      churchId: string;
      id: string;
      aprova: boolean;
      /** ao aprovar: os produtos que este lado aprova */
      produtosAceitos?: string[];
      resposta: string;
    }) =>
      apiClient
        .post(`/churches/${churchId}/solicitacoes/${id}/decisao`, dados)
        .then((response) =>
          handleResponseSuccess(
            response.data,
            dados.aprova ? 'Aprovação registrada' : 'Solicitação recusada'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_DA_IGREJA),
  });
