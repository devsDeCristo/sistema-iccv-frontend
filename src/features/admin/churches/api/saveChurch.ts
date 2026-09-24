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
  /** `null` desfaz o vínculo; quem é vinculado vira admin da igreja */
  spiritualLeaderId: string | null;
}

const saveChurch = ({ id, ...corpo }: SaveChurchParams) => {
  const requisicao = id
    ? apiClient.put(`/churches/${id}`, corpo)
    : apiClient.post('/churches', corpo);

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
