import { useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_USERS } from '../constants';

/**
 * Bloqueia a conta (`PUT /users/:id/block`): a pessoa não entra mais e as
 * sessões abertas dela caem. Só super admin e dev.
 */
export const useBloquearConta = () =>
  useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiClient.put(`/users/${userId}/block`, { reason }),
    onSuccess: () => queryClient.invalidateQueries(GET_USERS),
  });

/** Desbloqueia a conta (`DELETE /users/:id/block`) */
export const useDesbloquearConta = () =>
  useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/users/${userId}/block`),
    onSuccess: () => queryClient.invalidateQueries(GET_USERS),
  });
