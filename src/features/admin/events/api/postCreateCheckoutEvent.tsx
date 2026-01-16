import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PostCreateCheckoutEventProps = {
  eventId: string;
  userId: string;
  data: any;
};

const postCreateCheckoutEvent = ({ data, eventId, userId }: PostCreateCheckoutEventProps) =>
  apiClient
    .post<boolean>(`/events/${eventId}/users/${userId}/payments`, {roleRegistrationId: data.roleId})
    .then((response) => {
      handleResponseSuccess(response.data, 'Sala de pagamento criada com sucesso!')();
      return response.data;
    })
    .catch(handleResponseThrowError());

type PostCreateCheckoutEventData = Awaited<ReturnType<typeof postCreateCheckoutEvent>>;

export const usePostCreateCheckoutEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateCheckoutEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateCheckoutEvent,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
