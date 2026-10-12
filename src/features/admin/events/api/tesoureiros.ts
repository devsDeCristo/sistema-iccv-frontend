import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { TesoureiroDeEvento } from '../../../../types/user';

const GET_TESOUREIROS = 'GET_TESOUREIROS_DO_EVENTO';

export type TipoDeTesoureiro = TesoureiroDeEvento['kind'];

export interface TesoureiroDoEvento {
  id: string;
  fullName: string;
  email: string;
  profilePhotoUrl: string | null;
  kind: TipoDeTesoureiro;
}

const rota = (eventId: string) => `/events/${eventId}/tesoureiros`;

/** Os tesoureiros(as) do evento — o admin e a tesouraria da igreja veem */
export const useGetTesoureiros = (eventId: string, enabled: boolean) =>
  useQuery(
    [GET_TESOUREIROS, eventId],
    () =>
      apiClient
        .get<TesoureiroDoEvento[]>(rota(eventId))
        .then((response) => response.data),
    { enabled: !!eventId && enabled }
  );

/** Dá ou muda o vínculo (só o admin da igreja do evento) */
export const useSalvarTesoureiro = (eventId: string) =>
  useMutation({
    mutationFn: ({
      userId,
      kind,
    }: {
      userId: string;
      kind: TipoDeTesoureiro;
    }) =>
      apiClient
        .put<TesoureiroDoEvento[]>(`${rota(eventId)}/${userId}`, { kind })
        .then((response) =>
          handleResponseSuccess(response.data, 'Tesoureiro(a) salvo')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_TESOUREIROS),
  });

export const useRemoverTesoureiro = (eventId: string) =>
  useMutation({
    mutationFn: (userId: string) =>
      apiClient
        .delete<TesoureiroDoEvento[]>(`${rota(eventId)}/${userId}`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Tesoureiro(a) removido')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_TESOUREIROS),
  });
