import { useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_CALENDAR } from '../constants';
import { NewsCalendar } from '../types';

/** Disparos feitos e agendados no período, que o calendário pede mês a mês */
const getNewsCalendar = (from: Date, to: Date, churchId: string) =>
  apiClient
    .get<NewsCalendar>('/news/calendar', {
      params: {
        from: from.toISOString(),
        to: to.toISOString(),
        // "all": todas as igrejas que a pessoa alcança
        ...(churchId === 'all' ? {} : { churchId }),
      },
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

/** Multitenant: o calendário segue o seletor da tela — uma igreja, ou "all". */
export const useGetNewsCalendar = (from: Date, to: Date, churchId: string) =>
  useQuery(
    [GET_NEWS_CALENDAR, churchId, from.toISOString()],
    () => getNewsCalendar(from, to, churchId),
    { enabled: !!churchId }
  );
