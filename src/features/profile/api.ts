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

/** A mensagem que a API mandou, ou a genérica */
export const mensagemDoErro = (erro: any, generica: string): string =>
  [erro?.response?.data?.message].flat()[0] ?? generica;
