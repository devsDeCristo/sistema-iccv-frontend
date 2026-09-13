import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_DASHBOARD } from '../constants';
import { Dashboard } from '../types';

const getDashboard = (churchId?: string) =>
  apiClient
    .get<Dashboard>('/dashboard', {
      params: churchId ? { churchId } : undefined,
    })
    .then((response) => response.data);

type GetDashboardData = Awaited<ReturnType<typeof getDashboard>>;

/**
 * O resumo de abertura do painel.
 *
 * Sem `churchId` a API responde pelo vínculo de quem entrou — é assim que o
 * admin cai na home da igreja dele. Com `churchId`, responde por aquela
 * igreja, que é como a lista de igrejas abre a home de qualquer uma. Quem pode
 * pedir cada igreja quem decide é a API, não esta chamada.
 *
 * A igreja entra na chave do cache: sem ela, abrir a segunda igreja mostraria
 * os números da primeira até a resposta nova chegar.
 */
export const useGetDashboard = (
  churchId?: string,
  options: Omit<
    UseQueryOptions<GetDashboardData, unknown, GetDashboardData>,
    'queryKey' | 'queryFn'
  > = {}
) =>
  useQuery(
    [GET_DASHBOARD, churchId ?? null],
    () => getDashboard(churchId),
    options
  );
