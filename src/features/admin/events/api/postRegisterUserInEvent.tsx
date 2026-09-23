import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PostRegisterUserInEventProps = {
  eventId: string;
  userId: string;
  data: {
    roleId: string[];
    /** só quando o evento tem termo: o servidor recusa a inscrição sem isto */
    acceptedTerms?: boolean;
  };
};

const postRegisterUserInEvent = ({
  data,
  eventId,
  userId,
}: PostRegisterUserInEventProps) =>
  apiClient
    .post<boolean>(`/events/${eventId}/users/${userId}`, {
      roleRegistrationId: data.roleId,
      ...(data.acceptedTerms ? { acceptedTerms: true } : {}),
    })
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Inscrição realizada com sucesso!'
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

type PostRegisterUserInEventData = Awaited<
  ReturnType<typeof postRegisterUserInEvent>
>;

export const usePostRegisterUserInEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostRegisterUserInEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postRegisterUserInEvent,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
