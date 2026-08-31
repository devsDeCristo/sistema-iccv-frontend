import { useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';

const deleteChurch = (churchId: string) => {
  return apiClient.delete(`/churches/${churchId}`).then((response) => response.data);
};

export const useDeleteChurch = () => {
  return useMutation((churchId: string) => deleteChurch(churchId));
};
