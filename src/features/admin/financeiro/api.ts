import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { GET_PLUGGY } from '../../settings/integrations/api';
import { GET_MEMBROS } from '../membros/api';
import { GET_CONCILIACAO, GET_DIZIMISTAS, GET_LANCAMENTOS } from './constants';
import {
  Conciliacao,
  FiltrosDeLancamento,
  LancamentoPayload,
  ListaDeDizimistas,
  ListaDeLancamentos,
  ResultadoDaImportacao,
} from './types';

const rota = (churchId: string) => `/churches/${churchId}/financeiro`;

/**
 * Lançamento e dizimista se cruzam: o total do ano do dizimista sai dos
 * lançamentos de dízimo. Mexeu num, as duas telas recarregam — e Membros,
 * que lista as mesmas pessoas.
 */
const invalidar = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_DIZIMISTAS),
    queryClient.invalidateQueries(GET_LANCAMENTOS),
    queryClient.invalidateQueries(GET_MEMBROS),
    queryClient.invalidateQueries(GET_CONCILIACAO),
  ]);

// ---- dizimistas ------------------------------------------------------------

export const useGetDizimistas = (churchId: string | null, ano: number) =>
  useQuery(
    [GET_DIZIMISTAS, churchId ?? '', ano],
    () =>
      apiClient
        .get<ListaDeDizimistas>(`${rota(churchId as string)}/dizimistas`, {
          params: { ano },
        })
        .then((response) => response.data),
    { enabled: !!churchId, keepPreviousData: true }
  );

/** O valor do dízimo do membro; `null` tira (todo Pix dele vira dízimo) */
export const useDefinirValorDoDizimo = () =>
  useMutation({
    mutationFn: ({
      churchId,
      userId,
      titheAmount,
    }: {
      churchId: string;
      userId: string;
      titheAmount: number | null;
    }) =>
      apiClient
        .patch(`${rota(churchId)}/dizimistas/${userId}`, { titheAmount })
        .then((response) =>
          handleResponseSuccess(response.data, 'Valor do dízimo salvo')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

// ---- lançamentos -----------------------------------------------------------

export const useGetLancamentos = (
  churchId: string | null,
  filtros: FiltrosDeLancamento
) =>
  useQuery(
    [GET_LANCAMENTOS, churchId ?? '', filtros],
    () =>
      apiClient
        .get<ListaDeLancamentos>(`${rota(churchId as string)}/lancamentos`, {
          params: filtros,
        })
        .then((response) => response.data),
    { enabled: !!churchId, keepPreviousData: true }
  );

export const useSalvarLancamento = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      dados,
    }: {
      churchId: string;
      /** sem id, cria */
      id?: string;
      dados: Partial<LancamentoPayload>;
    }) =>
      (id
        ? apiClient.patch(`${rota(churchId)}/lancamentos/${id}`, dados)
        : apiClient.post(`${rota(churchId)}/lancamentos`, dados)
      )
        .then((response) =>
          handleResponseSuccess(
            response.data,
            id ? 'Lançamento atualizado' : 'Lançamento criado'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

export const useRemoverLancamento = () =>
  useMutation({
    mutationFn: ({ churchId, id }: { churchId: string; id: string }) =>
      apiClient
        .delete(`${rota(churchId)}/lancamentos/${id}`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Lançamento apagado')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

/** O toast com o resultado sai da tela, que sabe dizer quantas entraram */
export const useImportarDoBanco = () =>
  useMutation({
    mutationFn: (churchId: string) =>
      apiClient
        .post<ResultadoDaImportacao>(`${rota(churchId)}/lancamentos/importar`)
        .then((response) => response.data)
        .catch(handleResponseThrowError()),
    onSuccess: () =>
      Promise.all([invalidar(), queryClient.invalidateQueries(GET_PLUGGY)]),
  });

// ---- conciliação -----------------------------------------------------------

export const useGetConciliacao = (
  churchId: string | null,
  periodo: { de: string; ate: string }
) =>
  useQuery(
    [GET_CONCILIACAO, churchId ?? '', periodo],
    () =>
      apiClient
        .get<Conciliacao>(`${rota(churchId as string)}/conciliacao`, {
          params: periodo,
        })
        .then((response) => response.data),
    { enabled: !!churchId, keepPreviousData: true }
  );

export const useConciliar = () =>
  useMutation({
    mutationFn: ({
      churchId,
      bancoId,
      manualId,
    }: {
      churchId: string;
      bancoId: string;
      manualId: string;
    }) =>
      apiClient
        .post(`${rota(churchId)}/conciliacao`, { bancoId, manualId })
        .then((response) =>
          handleResponseSuccess(response.data, 'Conciliado')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

/** O toast sai da tela, que sabe quantos foram */
export const useConciliarSugeridos = () =>
  useMutation({
    mutationFn: ({
      churchId,
      ...periodo
    }: {
      churchId: string;
      de: string;
      ate: string;
    }) =>
      apiClient
        .post<{ conciliados: number }>(
          `${rota(churchId)}/conciliacao/sugeridos`,
          null,
          { params: periodo }
        )
        .then((response) => response.data)
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

export const useDesfazerConciliacao = () =>
  useMutation({
    mutationFn: ({
      churchId,
      manualId,
    }: {
      churchId: string;
      manualId: string;
    }) =>
      apiClient
        .delete(`${rota(churchId)}/conciliacao/${manualId}`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Conciliação desfeita')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });
