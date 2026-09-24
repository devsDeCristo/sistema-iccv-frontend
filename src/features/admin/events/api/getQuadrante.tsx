import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_TEAMS } from '../constants';
import { QuadranteData } from '../types';
import { handleResponseThrowError } from '../../../../utils/service';

interface GetQuadranteParams {
  eventId: string;
}

const getQuadrante = ({ eventId }: GetQuadranteParams) =>
  apiClient
    .get<QuadranteData>(`/events/${eventId}/quadrante`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type GetQuadranteData = Awaited<ReturnType<typeof getQuadrante>>;

/**
 * A chave começa por `GET_TEAMS` de propósito: toda edição de equipe já
 * invalida esse prefixo, e o quadrante é feito das equipes.
 */
export const useGetQuadrante = (
  params: GetQuadranteParams,
  options: Omit<
    UseQueryOptions<GetQuadranteData, unknown, GetQuadranteData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery(
    [GET_TEAMS, 'quadrante', params],
    () => getQuadrante(params),
    options
  );
};
