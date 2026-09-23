import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_TRANSPORTS } from '../constants';

type PutTransportProps = {
  eventId: string;
  transportId: string;
  data: any;
};

const putTransport = ({ data, eventId, transportId }: PutTransportProps) =>
  apiClient
    .put<boolean>(`/events/${eventId}/transport/${transportId}`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Transporte editado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PutTransportData = Awaited<ReturnType<typeof putTransport>>;

export const usePutTransport = ({
  onSuccess,
  ...options
}: MutationOptions<PutTransportData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: putTransport,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_TRANSPORTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
