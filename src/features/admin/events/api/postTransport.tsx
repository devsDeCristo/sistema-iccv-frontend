import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_TRANSPORTS } from '../constants';

type PostCreateTransportProps = {
  eventId: string;
  data: any;
};

const postCreateTransport = ({ data, eventId }: PostCreateTransportProps) =>
  apiClient
    .post<boolean>(`/events/${eventId}/transport`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Transporte criado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PostCreateTransportData = Awaited<ReturnType<typeof postCreateTransport>>;

export const usePostCreateTransport = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateTransportData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateTransport,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_TRANSPORTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
