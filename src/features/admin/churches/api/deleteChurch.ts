import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { GET_CHURCHES } from '../constants';

/**
 * O backend recusa igreja com evento ou administrador vinculado, e o motivo
 * vem na mensagem — por isso o erro sobe como toast em vez de morrer calado.
 */
const deleteChurch = (churchId: string) =>
  apiClient
    .delete(`/churches/${churchId}`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Igreja removida!')();
    })
    .catch(handleResponseThrowError());

type DeleteChurchData = Awaited<ReturnType<typeof deleteChurch>>;

export const useDeleteChurch = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteChurchData, unknown, string> = {}) =>
  useMutation({
    mutationFn: deleteChurch,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_CHURCHES);
      onSuccess?.(...args);
    },
    ...options,
  });
