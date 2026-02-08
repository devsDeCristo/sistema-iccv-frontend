import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENT_USERS_WAITLIST } from '../constants';

type RemoveUserFromWaitlistProps = {
  idEvent: string;
  idUser: string;
  roleRegistrationId: string;
};

const removeUserFromWaitlist = ({ idEvent, idUser, roleRegistrationId }: RemoveUserFromWaitlistProps) =>
  apiClient
    .delete<boolean>(`/events/${idEvent}/waitlist/users/${idUser}/rule/${roleRegistrationId}`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Usuário removido com sucesso!')();
    })
    .catch(handleResponseThrowError());

type RemoveUserFromWaitlistData = Awaited<ReturnType<typeof removeUserFromWaitlist>>;

export const useRemoveUserFromWaitlist = ({
  onSuccess,
  ...options
}: MutationOptions<
  RemoveUserFromWaitlistData,
  unknown,
  RemoveUserFromWaitlistProps
> = {}) => {
  return useMutation({
    mutationFn: removeUserFromWaitlist,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENT_USERS_WAITLIST);
      onSuccess?.(...args);
    },
    ...options,
  });
};
