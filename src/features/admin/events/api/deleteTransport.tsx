import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_TRANSPORTS } from '../constants';

type DeleteTransportProps = {
  eventId: string;
  transportId: string;
};

const deleteTransport = ({ eventId, transportId }: DeleteTransportProps) =>
  apiClient
    .delete<boolean>(`/events/${eventId}/transport/${transportId}`)
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Transporte removido com sucesso!'
      )();
    })
    .catch(handleResponseThrowError());

type DeleteTransportData = Awaited<ReturnType<typeof deleteTransport>>;

export const useDeleteTransport = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteTransportData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: deleteTransport,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_TRANSPORTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
