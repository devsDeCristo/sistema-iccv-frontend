import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { GET_CHURCHES } from '../constants';

interface SaveChurchParams {
  /** Sem id é criação; com id é renomear */
  id?: string;
  name: string;
}

const saveChurch = ({ id, name }: SaveChurchParams) => {
  const requisicao = id
    ? apiClient.put(`/churches/${id}`, { name })
    : apiClient.post('/churches', { name });

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
