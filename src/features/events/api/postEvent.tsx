import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';

type PostCreateEventProps = {
  data: any;
};

const postCreateEvent = ({ data }: PostCreateEventProps) =>
  apiClient
    .post<boolean>(`/events`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Evento criado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PostCreateEventData = Awaited<ReturnType<typeof postCreateEvent>>;

export const usePostCreateEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateEvent,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
