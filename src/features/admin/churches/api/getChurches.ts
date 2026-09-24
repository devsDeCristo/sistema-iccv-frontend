import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { ChurchStatus, GET_CHURCHES } from '../constants';

export interface Church {
  id: string;
  name: string;
  /** Ativa, inativa ou em teste. Só a ativa entra no filtro da home. */
  status: ChurchStatus;
  /** Quem responde pela igreja e assina o e-mail dos eventos dela */
  spiritualLeader?: { id: string; fullName: string } | null;
  /**
   * Vínculos da igreja. `users` conta só quem entra no painel (admin e
   * financeiro) — inscrito não pertence a igreja nenhuma. É o que impede a
   * remoção: apagar a igreja levaria os eventos dela junto.
   */
  _count?: {
    users: number;
    events: number;
  };
}

const getChurches = () => {
  return apiClient.get<Church[]>('/churches').then((response) => response.data);
};

type GetChurchesData = Awaited<ReturnType<typeof getChurches>>;

export const useGetChurches = (
  options: Omit<
    UseQueryOptions<GetChurchesData, unknown, GetChurchesData>,
    'queryKey' | 'queryFn'
  > = {}
) => useQuery([GET_CHURCHES], getChurches, options);
