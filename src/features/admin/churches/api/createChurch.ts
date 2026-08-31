import { useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';

export interface CreateChurchData {
  name: string;
}

const createChurch = (data: CreateChurchData) => {
  return apiClient.post('/churches', data).then((response) => response.data);
};

export const useCreateChurch = () => {
  return useMutation((data: CreateChurchData) => createChurch(data));
};
