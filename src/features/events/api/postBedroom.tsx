import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_BEDROOMS } from '../constants';

type PostCreateBedroomProps = {
  eventId: string;
  data: any;
};

const postCreateBedroom = ({ data, eventId }: PostCreateBedroomProps) =>
  apiClient
    .post<boolean>(`/events/${eventId}/bedrooms`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Quarto criado com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PostCreateBedroomData = Awaited<ReturnType<typeof postCreateBedroom>>;

export const usePostCreateBedroom = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateBedroomData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateBedroom,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_BEDROOMS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
