import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENT_USERS } from '../constants';
import { GET_PAYMENTS_USER } from '../../../myRegisters/constants';

type PostGuardianTermProps = {
  eventId: string;
  userId: string;
  termFile: File;
};

const postGuardianTerm = ({ eventId, userId, termFile }: PostGuardianTermProps) => {
  const formData = new FormData();
  formData.append('termFile', termFile);

  return apiClient
    .post<boolean>(`/events/${eventId}/users/${userId}/guardian-term`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      handleResponseSuccess(response.data, 'Termo enviado com sucesso!')();
      return response.data;
    })
    .catch(handleResponseThrowError());
};

type PostGuardianTermData = Awaited<ReturnType<typeof postGuardianTerm>>;

export const usePostGuardianTerm = ({
  onSuccess,
  ...options
}: MutationOptions<PostGuardianTermData, unknown, PostGuardianTermProps> = {}) => {
  return useMutation({
    mutationFn: postGuardianTerm,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENT_USERS);
      queryClient.invalidateQueries(GET_PAYMENTS_USER);
      onSuccess?.(...args);
    },
    ...options,
  });
};
