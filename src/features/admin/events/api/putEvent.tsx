import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';

type PutUpdateEventProps = {
  data: any;
  id: string;
};

const putUpdateEvent = ({ data, id }: PutUpdateEventProps) =>
  apiClient
    .put<boolean>(`/events/${id}`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Evento editado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PostCreateEventData = Awaited<ReturnType<typeof putUpdateEvent>>;

export const usePutUpdateEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: putUpdateEvent,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
