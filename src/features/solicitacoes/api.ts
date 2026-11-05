import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../utils/service';
import {
  MinhaSolicitacao,
  SolicitacaoDaIgreja,
  StatusDaSolicitacao,
} from './types';

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

export const useMudarStatus = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      ...dados
    }: {
      churchId: string;
      id: string;
      status: StatusDaSolicitacao;
      resposta: string;
      /** só na parcial: os ids dos produtos aceitos */
      produtosAceitos?: string[];
    }) =>
      apiClient
        .patch(`/churches/${churchId}/solicitacoes/${id}/status`, dados)
        .then((response) =>
          handleResponseSuccess(response.data, 'Solicitação respondida')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_DA_IGREJA),
  });
