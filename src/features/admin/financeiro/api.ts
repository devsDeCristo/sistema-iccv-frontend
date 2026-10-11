import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { GET_PLUGGY } from '../../settings/integrations/api';
import {
  BUSCAR_USUARIOS_DIZIMISTA,
  GET_DIZIMISTAS,
  GET_LANCAMENTOS,
} from './constants';
import {
  FiltrosDeLancamento,
  LancamentoPayload,
  ListaDeDizimistas,
  ListaDeLancamentos,
  ResultadoDaImportacao,
  UsuarioEncontrado,
} from './types';

const rota = (churchId: string) => `/churches/${churchId}/financeiro`;

/**
 * Lançamento e dizimista se cruzam: o total do ano do dizimista sai dos
 * lançamentos de dízimo. Mexeu num, as duas telas recarregam.
 */
const invalidar = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_DIZIMISTAS),
    queryClient.invalidateQueries(GET_LANCAMENTOS),
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

/** Nome com 3+ letras ou CPF completo; antes disso nem pergunta */
export const useBuscarUsuarios = (churchId: string | null, busca: string) => {
  const texto = busca.trim();
  const valida = texto.replace(/\D/g, '').length === 11 || texto.length >= 3;
  return useQuery(
    [BUSCAR_USUARIOS_DIZIMISTA, churchId ?? '', texto],
    () =>
      apiClient
        .get<UsuarioEncontrado[]>(`${rota(churchId as string)}/usuarios`, {
          params: { busca: texto },
        })
        .then((response) => response.data),
    { enabled: !!churchId && valida, keepPreviousData: true }
  );
};

export const useCriarDizimista = () =>
  useMutation({
    mutationFn: ({
      churchId,
      ...dados
    }: {
      churchId: string;
      userId: string;
      since?: string;
      notes?: string;
      expectedAmount?: number;
    }) =>
      apiClient
        .post(`${rota(churchId)}/dizimistas`, dados)
        .then((response) =>
          handleResponseSuccess(response.data, 'Dizimista adicionado')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

export const useAtualizarDizimista = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      ...dados
    }: {
      churchId: string;
      id: string;
      active?: boolean;
      since?: string | null;
      notes?: string | null;
      expectedAmount?: number | null;
    }) =>
      apiClient
        .patch(`${rota(churchId)}/dizimistas/${id}`, dados)
        .then((response) =>
          handleResponseSuccess(response.data, 'Dizimista atualizado')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

export const useRemoverDizimista = () =>
  useMutation({
    mutationFn: ({ churchId, id }: { churchId: string; id: string }) =>
      apiClient
        .delete(`${rota(churchId)}/dizimistas/${id}`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Dizimista removido')()
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
