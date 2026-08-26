import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS, GET_NEWS_ADMIN } from '../constants';

const deleteNews = (id: string) =>
  apiClient
    .delete(`/news/${id}`)
    .then(() => undefined)
    .catch(handleResponseThrowError());

type DeleteNewsData = Awaited<ReturnType<typeof deleteNews>>;

export const useDeleteNews = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteNewsData, unknown, string> = {}) =>
  useMutation({
    mutationFn: deleteNews,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_NEWS);
      queryClient.invalidateQueries(GET_NEWS_ADMIN);
      onSuccess?.(...args);
    },
    ...options,
  });
