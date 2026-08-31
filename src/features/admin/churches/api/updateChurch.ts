import { useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';

export interface UpdateChurchData {
  name: string;
}

interface UpdateParams {
  churchId: string;
  data: UpdateChurchData;
}

const updateChurch = ({ churchId, data }: UpdateParams) => {
  return apiClient.put(`/churches/${churchId}`, data).then((response) => response.data);
};

export const useUpdateChurch = () => {
  return useMutation((params: UpdateParams) => updateChurch(params));
};
