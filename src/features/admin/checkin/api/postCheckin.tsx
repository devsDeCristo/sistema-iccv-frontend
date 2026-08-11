import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { handleResponseThrowError } from '../../../../utils/service';
import {
  GET_CHECKIN_QUEUE,
  GET_CHECKIN_SEARCH,
  GET_CHECKIN_STATS,
} from '../constants';
import { CheckinParticipant } from '../types';

/**
 * Toda etapa mexe na fila e nos contadores. O socket também avisa as outras
 * telas, mas quem executou a ação não deve depender do round-trip para ver o
 * próprio resultado.
 */
const invalidateCheckin = () => {
  queryClient.invalidateQueries(GET_CHECKIN_QUEUE);
  queryClient.invalidateQueries(GET_CHECKIN_STATS);
  queryClient.invalidateQueries(GET_CHECKIN_SEARCH);
};

type StepParams = { eventId: string; userId: string };

const post = <T,>(url: string, data?: unknown) =>
  apiClient
    .post<T>(url, data)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type MutationConfig<TData, TVariables> = MutationOptions<
  TData,
  unknown,
  TVariables
>;

/** Etapa 1 — recepção entrega o crachá e a pessoa entra na fila */
export const useDeliverBadge = ({
  onSuccess,
  ...options
}: MutationConfig<CheckinParticipant, StepParams> = {}) =>
  useMutation({
    mutationFn: ({ eventId, userId }: StepParams) =>
      post<CheckinParticipant>(`/events/${eventId}/checkin/${userId}/badge`),
    onSuccess: (...args) => {
      invalidateCheckin();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Etapa 2 — chama o primeiro da fila */
export const useCallNext = ({
  onSuccess,
  ...options
}: MutationConfig<CheckinParticipant, { eventId: string }> = {}) =>
  useMutation({
    mutationFn: ({ eventId }: { eventId: string }) =>
      post<CheckinParticipant>(`/events/${eventId}/checkin/call-next`),
    onSuccess: (...args) => {
      invalidateCheckin();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Etapa 2 — chama alguém específico, fora da ordem */
export const useCallParticipant = ({
  onSuccess,
  ...options
}: MutationConfig<CheckinParticipant, StepParams> = {}) =>
  useMutation({
    mutationFn: ({ eventId, userId }: StepParams) =>
      post<CheckinParticipant>(`/events/${eventId}/checkin/${userId}/call`),
    onSuccess: (...args) => {
      invalidateCheckin();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Etapa 3 — foto tirada e dados conferidos */
export const useCompleteCheckin = ({
  onSuccess,
  ...options
}: MutationConfig<CheckinParticipant, StepParams & { notes?: string }> = {}) =>
  useMutation({
    mutationFn: ({ eventId, userId, notes }: StepParams & { notes?: string }) =>
      post<CheckinParticipant>(`/events/${eventId}/checkin/${userId}/complete`, {
        ...(notes ? { notes } : {}),
      }),
    onSuccess: (...args) => {
      invalidateCheckin();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Volta uma etapa — erro de balcão acontece */
export const useUndoCheckin = ({
  onSuccess,
  ...options
}: MutationConfig<CheckinParticipant, StepParams> = {}) =>
  useMutation({
    mutationFn: ({ eventId, userId }: StepParams) =>
      post<CheckinParticipant>(`/events/${eventId}/checkin/${userId}/undo`),
    onSuccess: (...args) => {
      invalidateCheckin();
      onSuccess?.(...args);
    },
    ...options,
  });

/**
 * Foto do participante. Reaproveita o endpoint que já existe para foto de
 * perfil, em vez de criar um upload próprio do check-in.
 */
export const useUploadProfilePhoto = ({
  onSuccess,
  ...options
}: MutationConfig<unknown, { userId: string; file: File }> = {}) =>
  useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) => {
      const formData = new FormData();
      formData.append('photo', file);

      return apiClient
        .post(`/users/${userId}/profile-photo`, formData)
        .then((response) => response.data)
        .catch(handleResponseThrowError());
    },
    onSuccess: (...args) => {
      invalidateCheckin();
      onSuccess?.(...args);
    },
    ...options,
  });
