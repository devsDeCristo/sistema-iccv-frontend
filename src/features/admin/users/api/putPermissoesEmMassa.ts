import { useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_USERS } from '../constants';
import { GET_MEMBROS } from '../../membros/api';

export type PermissoesEmMassa = {
  userIds: string[];
  churchId: string;
  /** admin ou tesouraria; `null` tira o perfil na igreja */
  role: number | null;
};

export type ResultadoEmMassa = {
  atualizados: number;
  /** quem o servidor recusou, com o motivo — não derruba os outros */
  falhas: { userId: string; nome: string | null; motivo: string }[];
};

/** O mesmo perfil, numa igreja, para várias pessoas (`PUT /users/permissions`) */
export const usePutPermissoesEmMassa = () =>
  useMutation({
    mutationFn: (dados: PermissoesEmMassa) =>
      apiClient
        .put<ResultadoEmMassa>('/users/permissions', dados)
        .then((resposta) => resposta.data),
    // a tela de Membros também mostra o perfil de cada um
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries(GET_USERS),
        queryClient.invalidateQueries(GET_MEMBROS),
      ]),
  });
