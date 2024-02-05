import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_BEDROOMS } from '../constants';

type DeleteBedroomProps = {
  eventId: number;
  bedRoomId: number;
};

const deleteBedroom = ({ eventId, bedRoomId }: DeleteBedroomProps) =>
  apiClient
    .delete<boolean>(`/events/${eventId}/bedrooms/${bedRoomId}`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Quarto removido com sucesso!')();
    })
    .catch(handleResponseThrowError());

type DeleteBedroomData = Awaited<ReturnType<typeof deleteBedroom>>;

export const useDeleteBedroom = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteBedroomData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: deleteBedroom,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_BEDROOMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
