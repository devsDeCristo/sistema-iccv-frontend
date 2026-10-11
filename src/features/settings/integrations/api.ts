import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';

export const GET_PLUGGY = 'GET_PLUGGY';

export interface PluggyIntegration {
  enabled: boolean;
  credentialsHint: { clientId?: string } | null;
  itemIds: string[];
  /** Aviso de banco pedindo reconexão no MeuPluggy. Nulo: tudo certo */
  statusMessage: string | null;
  lastSyncAt: string | null;
  updatedAt: string;
}

interface PluggyResponse {
  cofreDisponivel: boolean;
  integracao: PluggyIntegration | null;
}

export interface PluggyItemTeste {
  itemId: string;
  ok: boolean;
  banco?: string | null;
  status?: string;
  contas?: number;
  atualizadoEm?: string | null;
  erro?: string;
}

export interface PluggyTeste {
  ok: boolean;
  erro?: string;
  itens: PluggyItemTeste[];
}

export interface SavePluggyPayload {
  churchId: string;
  /** Em branco não vai: o servidor mantém o gravado */
  clientId?: string;
  clientSecret?: string;
  itemIds: string[];
  enabled: boolean;
}

const rota = (churchId: string) => `/churches/${churchId}/pluggy`;

const invalidar = () => queryClient.invalidateQueries(GET_PLUGGY);

export const useGetPluggy = (churchId: string | null) =>
  useQuery(
    [GET_PLUGGY, churchId ?? ''],
    () =>
      apiClient
        .get<PluggyResponse>(rota(churchId as string))
        .then((response) => response.data),
    { enabled: !!churchId }
  );

export const useSavePluggy = () =>
  useMutation({
    mutationFn: ({ churchId, ...payload }: SavePluggyPayload) =>
      apiClient
        .put(rota(churchId), payload)
        .then((response) =>
          handleResponseSuccess(response.data, 'Integração salva')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

/** Sem toast de sucesso: o resultado aparece na própria tela, item a item */
export const useTestPluggy = () =>
  useMutation({
    mutationFn: (churchId: string) =>
      apiClient
        .post<PluggyTeste>(`${rota(churchId)}/test`)
        .then((response) => response.data)
        .catch(handleResponseThrowError()),
  });

export const useRemovePluggy = () =>
  useMutation({
    mutationFn: (churchId: string) =>
      apiClient
        .delete(rota(churchId))
        .then((response) =>
          handleResponseSuccess(response.data, 'Integração removida')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });
