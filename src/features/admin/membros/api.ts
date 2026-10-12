import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { GET_DIZIMISTAS } from '../tesouraria/constants';
import { ListaDeMembros, PessoaEncontrada } from './types';

export const GET_MEMBROS = 'GET_MEMBROS';
const BUSCAR_PESSOAS = 'BUSCAR_PESSOAS_MEMBRO';

const rota = (churchId: string) => `/churches/${churchId}`;

/** Os dizimistas são os membros: as duas telas recarregam */
const invalidar = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_MEMBROS),
    queryClient.invalidateQueries(GET_DIZIMISTAS),
  ]);

/** A busca vale com o CPF completo ou com pelo menos dois nomes */
export const buscaValida = (texto: string) => {
  const t = texto.trim();
  if (t.replace(/\D/g, '').length === 11) return true;
  return (
    t.split(/\s+/).filter((n) => n.replace(/\d/g, '').length >= 2).length >= 2
  );
};

export const useGetMembros = (churchId: string | null) =>
  useQuery(
    [GET_MEMBROS, churchId ?? ''],
    () =>
      apiClient
        .get<ListaDeMembros>(`${rota(churchId as string)}/membros`)
        .then((response) => response.data),
    { enabled: !!churchId, keepPreviousData: true }
  );

export const useBuscarPessoas = (churchId: string | null, busca: string) =>
  useQuery(
    [BUSCAR_PESSOAS, churchId ?? '', busca.trim()],
    () =>
      apiClient
        .get<PessoaEncontrada[]>(`${rota(churchId as string)}/membros/busca`, {
          params: { busca: busca.trim() },
        })
        .then((response) => response.data),
    { enabled: !!churchId && buscaValida(busca), keepPreviousData: true }
  );

/** Uma ação sem corpo de resposta, com o toast de sucesso */
const acao =
  (
    mensagem: string,
    chamar: (churchId: string, id: string) => Promise<{ data: unknown }>
  ) =>
  () =>
    useMutation({
      mutationFn: ({ churchId, id }: { churchId: string; id: string }) =>
        chamar(churchId, id)
          .then((response) => handleResponseSuccess(response.data, mensagem)())
          .catch(handleResponseThrowError()),
      onSuccess: invalidar,
    });

export const useAdicionarMembro = acao('Membro adicionado', (churchId, id) =>
  apiClient.post(`${rota(churchId)}/membros`, { userId: id })
);
export const useAceitarPedido = acao('Pedido aceito', (churchId, id) =>
  apiClient.post(`${rota(churchId)}/membros/${id}/aceitar`)
);
export const useRecusarPedido = acao('Pedido recusado', (churchId, id) =>
  apiClient.post(`${rota(churchId)}/membros/${id}/recusar`)
);
export const useRemoverMembro = acao('Membro removido', (churchId, id) =>
  apiClient.delete(`${rota(churchId)}/membros/${id}`)
);
export const useTirarDaFamilia = acao('Saiu da família', (churchId, id) =>
  apiClient.delete(`${rota(churchId)}/membros/${id}/familia`)
);
export const useDesfazerFamilia = acao('Família desfeita', (churchId, id) =>
  apiClient.delete(`${rota(churchId)}/familias/${id}`)
);

/** Nova família com os escolhidos, ou os escolhidos numa família que já existe */
export const useJuntarEmFamilia = () =>
  useMutation({
    mutationFn: ({
      churchId,
      userIds,
      familiaId,
      nome,
    }: {
      churchId: string;
      userIds: string[];
      /** sem id, cria uma família com `nome` */
      familiaId?: string;
      nome?: string;
    }) =>
      (familiaId
        ? apiClient.patch(`${rota(churchId)}/familias/${familiaId}`, {
            adicionar: userIds,
          })
        : apiClient.post(`${rota(churchId)}/familias`, { nome, userIds })
      )
        .then((response) =>
          handleResponseSuccess(response.data, 'Família atualizada')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

export const useRenomearFamilia = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      nome,
    }: {
      churchId: string;
      id: string;
      nome: string;
    }) =>
      apiClient
        .patch(`${rota(churchId)}/familias/${id}`, { nome })
        .then((response) =>
          handleResponseSuccess(response.data, 'Família renomeada')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });
