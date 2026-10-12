import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { ModuloDaIgreja } from '../../../constants/modulos';
import { GET_CHURCHES } from '../churches/constants';

export const GET_PLANOS = 'GET_PLANOS';

export interface Plano {
  id: string;
  name: string;
  description: string | null;
  modules: ModuloDaIgreja[];
  _count: { churches: number };
}

export type PlanoPayload = Pick<Plano, 'name' | 'description' | 'modules'>;

/** Os planos mudam o que as igrejas mostram: a lista de igrejas recarrega junto */
const invalidar = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_PLANOS),
    queryClient.invalidateQueries(GET_CHURCHES),
  ]);

export const useGetPlanos = (enabled = true) =>
  useQuery(
    [GET_PLANOS],
    () => apiClient.get<Plano[]>('/plans').then((response) => response.data),
    { enabled }
  );

export const useSalvarPlano = () =>
  useMutation({
    mutationFn: ({ id, ...corpo }: PlanoPayload & { id?: string }) =>
      (id
        ? apiClient.put(`/plans/${id}`, corpo)
        : apiClient.post('/plans', corpo)
      )
        .then((response) =>
          handleResponseSuccess(
            response.data,
            id ? 'Plano atualizado' : 'Plano criado'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });

export const useRemoverPlano = () =>
  useMutation({
    mutationFn: (id: string) =>
      apiClient
        .delete(`/plans/${id}`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Plano apagado')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: invalidar,
  });
