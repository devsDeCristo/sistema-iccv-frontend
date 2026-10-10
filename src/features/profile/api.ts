import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';
import { User } from '../../types/user';

/**
 * O perfil fala só com as rotas `me`: o id é o do token, e não há nada na URL
 * que alguém troque para chegar ao cadastro de outra pessoa.
 */
export const GET_ME = 'GET_ME';

export const useGetMe = () =>
  useQuery([GET_ME], () =>
    apiClient.get<User>('/users/me').then((resposta) => resposta.data)
  );

const atualizarPerfil = () => queryClient.invalidateQueries(GET_ME);

export const usePutMe = () =>
  useMutation({
    mutationFn: (dados: Record<string, unknown>) =>
      apiClient.put('/users/me', dados).then((resposta) => resposta.data),
    onSuccess: atualizarPerfil,
  });

export const usePostMyPhoto = () =>
  useMutation({
    mutationFn: (foto: File) => {
      const corpo = new FormData();
      corpo.append('photo', foto);
      return apiClient
        .post('/users/me/profile-photo', corpo)
        .then((resposta) => resposta.data);
    },
    onSuccess: atualizarPerfil,
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: (dados: { currentPassword: string; password: string }) =>
      apiClient
        .post<{ message: string }>('/auth/password/change', dados)
        .then((resposta) => resposta.data),
  });

/** Uma conta de fora que entra no lugar de CPF e senha — hoje só o Google */
export type ContaVinculada = {
  provider: 'GOOGLE';
  /** o e-mail da conta no Google, que pode ser diferente do cadastro */
  email: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const CONTAS_VINCULADAS = 'CONTAS_VINCULADAS';

export const useContasVinculadas = () =>
  useQuery([CONTAS_VINCULADAS], () =>
    apiClient
      .get<ContaVinculada[]>('/auth/identities')
      .then((resposta) => resposta.data)
  );

const atualizarContas = () => queryClient.invalidateQueries(CONTAS_VINCULADAS);

/** Pede a senha atual: o servidor confere antes de olhar o token do Google */
export const useVincularGoogle = () =>
  useMutation({
    mutationFn: (dados: { credential: string; currentPassword: string }) =>
      apiClient
        .post<ContaVinculada>('/auth/identities/google', dados)
        .then((resposta) => resposta.data),
    onSuccess: atualizarContas,
  });

export const useDesvincularGoogle = () =>
  useMutation({
    mutationFn: () =>
      apiClient
        .delete<{ message: string }>('/auth/identities/google')
        .then((resposta) => resposta.data),
    onSuccess: atualizarContas,
  });

/** A mensagem que a API mandou, ou a genérica */
export const mensagemDoErro = (erro: any, generica: string): string =>
  [erro?.response?.data?.message].flat()[0] ?? generica;
