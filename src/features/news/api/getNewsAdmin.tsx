import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_ADMIN } from '../constants';
import { News } from '../types';

/**
 * Lista do admin: inclui rascunho. É rota separada no backend porque só ela
 * confere o perfil no banco.
 */
const getNewsAdmin = () =>
  apiClient
    .get<News[]>('/news/admin')
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type GetNewsAdminData = Awaited<ReturnType<typeof getNewsAdmin>>;

export const useGetNewsAdmin = (
  options: Omit<
    UseQueryOptions<GetNewsAdminData, unknown, GetNewsAdminData>,
    'queryKey' | 'queryFn'
  > = {}
) => useQuery([GET_NEWS_ADMIN], getNewsAdmin, options);
