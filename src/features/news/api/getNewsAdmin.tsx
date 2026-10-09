import { useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_ADMIN } from '../constants';
import { News } from '../types';

/**
 * Lista do admin: inclui rascunho. É rota separada no backend porque só ela
 * confere o perfil no banco.
 */
const getNewsAdmin = (churchId: string) =>
  apiClient
    .get<News[]>('/news/admin', {
      // "all": todas as igrejas que a pessoa alcança — o backend recorta
      params: churchId === 'all' ? {} : { churchId },
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

/** Multitenant: a lista segue o seletor da tela — uma igreja, ou "all". */
export const useGetNewsAdmin = (churchId: string) =>
  useQuery([GET_NEWS_ADMIN, churchId], () => getNewsAdmin(churchId), {
    enabled: !!churchId,
  });
