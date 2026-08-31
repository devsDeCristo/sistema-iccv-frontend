import { useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';

export interface Church {
  id: string;
  name: string;
  /** vínculos que impedem a remoção — a igreja só sai quando está vazia */
  _count?: {
    users: number;
    events: number;
  };
}

export const GET_CHURCHES = 'GET_CHURCHES';

const getChurches = () => {
  return apiClient.get<Church[]>('/churches').then((response) => response.data);
};

export const useGetChurches = () => {
  return useQuery([GET_CHURCHES], () => getChurches());
};
