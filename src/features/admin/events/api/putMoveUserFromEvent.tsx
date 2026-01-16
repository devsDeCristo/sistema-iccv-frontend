import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PutMoveUserFromEventProps = {
  idUser: string;
  idEvent: string;
  rule: string;
};

const putMoveUserFromEvent = ({
  idUser,
  idEvent,
  rule,
}: PutMoveUserFromEventProps) =>
  apiClient
    .put<boolean>(`/events/${idEvent}/waitlist/users/${idUser}/rule/${rule}`, {})
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
