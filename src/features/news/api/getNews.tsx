import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS } from '../constants';
import { News } from '../types';

interface GetNewsParams {
  /** Quantas notícias trazer; sem valor, vêm todas as publicadas */
  take?: number;
}

const getNews = ({ take }: GetNewsParams) =>
  apiClient
    .get<News[]>('/news', { params: take ? { take } : undefined })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type GetNewsData = Awaited<ReturnType<typeof getNews>>;

export const useGetNews = (
  params: GetNewsParams = {},
  options: Omit<
    UseQueryOptions<GetNewsData, unknown, GetNewsData>,
    'queryKey' | 'queryFn'
  > = {}
) => useQuery([GET_NEWS, params], () => getNews(params), options);
