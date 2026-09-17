import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENT_USERS } from '../constants';

type PutGuardianApprovalProps = {
  eventId: string;
  userId: string;
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
};

const putGuardianApproval = ({
  eventId,
  userId,
  status,
  reason,
}: PutGuardianApprovalProps) =>
  apiClient
    .put<boolean>(`/events/${eventId}/users/${userId}/guardian-approval`, {
      status,
      reason,
    })
    .then((response) => {
      handleResponseSuccess(
        response.data,
        status === 'APPROVED'
          ? 'Participante liberado com sucesso!'
          : 'Inscrição recusada.'
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

type PutGuardianApprovalData = Awaited<ReturnType<typeof putGuardianApproval>>;

export const usePutGuardianApproval = ({
  onSuccess,
  ...options
}: MutationOptions<PutGuardianApprovalData, unknown, PutGuardianApprovalProps> = {}) => {
  return useMutation({
    mutationFn: putGuardianApproval,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENT_USERS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
