import { useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';
import { EventStatus } from '../types';

export type ResultadoDoStatusEmMassa = {
  atualizados: number;
  /** os que o servidor recusou (outra igreja), com o motivo */
  falhas: { eventId: string; nome: string | null; motivo: string }[];
};

/** O mesmo status para vários eventos (`PUT /events/status`) */
export const usePutStatusEmMassa = () =>
  useMutation({
    mutationFn: (dados: { eventIds: string[]; status: EventStatus }) =>
      apiClient
        .put<ResultadoDoStatusEmMassa>('/events/status', dados)
        .then((resposta) => resposta.data),
    onSuccess: () => queryClient.invalidateQueries(GET_EVENTS),
  });
