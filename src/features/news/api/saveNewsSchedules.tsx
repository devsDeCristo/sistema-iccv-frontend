import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_ADMIN, GET_NEWS_CALENDAR } from '../constants';
import { NewsSchedule } from '../types';

interface SaveNewsSchedulesParams {
  newsId: string;
  /** a lista inteira: substitui a atual, e vazia cancela todos */
  schedules: NewsSchedule[];
}

const saveNewsSchedules = ({ newsId, schedules }: SaveNewsSchedulesParams) =>
  apiClient
    .put<NewsSchedule[]>(`/news/${newsId}/schedules`, {
      schedules: schedules.map(({ kind, runAt, weekdays, time }) =>
        kind === 'ONCE' ? { kind, runAt } : { kind, weekdays, time }
      ),
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useSaveNewsSchedules = ({
  onSuccess,
  ...options
}: MutationOptions<NewsSchedule[], unknown, SaveNewsSchedulesParams> = {}) =>
  useMutation({
    mutationFn: saveNewsSchedules,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_NEWS_ADMIN);
      queryClient.invalidateQueries(GET_NEWS_CALENDAR);
      onSuccess?.(...args);
    },
    ...options,
  });
