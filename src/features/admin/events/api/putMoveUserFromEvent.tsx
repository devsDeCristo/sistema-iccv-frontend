import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PutMoveUserFromEventProps = {
  idUser: string;
  idEvent: string;
  idUserRemoved: string;
  rule: string;
};

const putMoveUserFromEvent = ({
  idUser,
  idEvent,
  idUserRemoved,
  rule,
}: PutMoveUserFromEventProps) =>
  apiClient
  //está fora do padrão REST, depois a gente vê sso
    .put<boolean>(`/events/${idEvent}/waitlist/move`, {
      userFromWaitlistId: idUser,
      userToRemoveId: idUserRemoved,
      roleRegistrationId: rule,
    })
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Inscrição realizada com sucesso',
      )();
    })
    .catch(handleResponseThrowError());

type PutMoveUserFromEventData = Awaited<
  ReturnType<typeof putMoveUserFromEvent>
>;

export const usePutMoveUserFromEvent = ({
  onSuccess,
  ...options
}: MutationOptions<
  PutMoveUserFromEventData,
  unknown,
  PutMoveUserFromEventProps
> = {}) => {
  return useMutation({
    mutationFn:   putMoveUserFromEvent,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
