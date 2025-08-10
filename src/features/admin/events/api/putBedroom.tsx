import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_BEDROOMS } from '../constants';

type PutBedroomProps = {
  eventId: string;
  bedRoomId: string;
  data: any;
};

const putBedroom = ({ data, eventId, bedRoomId }: PutBedroomProps) =>
  apiClient
    .put<boolean>(`/events/${eventId}/bedrooms/${bedRoomId}`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Quarto editado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PutBedroomData = Awaited<ReturnType<typeof putBedroom>>;

export const usePutBedroom = ({
  onSuccess,
  ...options
}: MutationOptions<PutBedroomData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: putBedroom,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_BEDROOMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
