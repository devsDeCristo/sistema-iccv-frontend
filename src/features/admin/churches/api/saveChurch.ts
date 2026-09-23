import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { ChurchStatus, GET_CHURCHES } from '../constants';

interface SaveChurchParams {
  /** Sem id é criação; com id é edição */
  id?: string;
  name: string;
  status: ChurchStatus;
}

const saveChurch = ({ id, name, status }: SaveChurchParams) => {
  const requisicao = id
    ? apiClient.put(`/churches/${id}`, { name, status })
    : apiClient.post('/churches', { name, status });

  return requisicao
    .then((response) => {
      handleResponseSuccess(
        response.data,
        id ? 'Igreja atualizada!' : 'Igreja criada!'
      )();
    })
    .catch(handleResponseThrowError());
};

type SaveChurchData = Awaited<ReturnType<typeof saveChurch>>;

export const useSaveChurch = ({
  onSuccess,
  ...options
}: MutationOptions<SaveChurchData, unknown, SaveChurchParams> = {}) =>
  useMutation({
    mutationFn: saveChurch,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_CHURCHES);
      onSuccess?.(...args);
    },
    ...options,
  });
