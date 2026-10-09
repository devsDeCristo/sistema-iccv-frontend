import { useQuery } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../utils/service';
import { GET_NEWS_CALENDAR } from '../constants';
import { NewsCalendar } from '../types';

/** Disparos feitos e agendados no período, que o calendário pede mês a mês */
const getNewsCalendar = (from: Date, to: Date) =>
  apiClient
    .get<NewsCalendar>('/news/calendar', {
      params: { from: from.toISOString(), to: to.toISOString() },
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useGetNewsCalendar = (from: Date, to: Date) =>
  useQuery([GET_NEWS_CALENDAR, from.toISOString()], () =>
    getNewsCalendar(from, to)
  );
