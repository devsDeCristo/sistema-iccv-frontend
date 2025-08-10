import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';

type PostProfilePhotoUserParams = {
  userId: string | null; // Alterada para aceitar null
  data: any;
};

const postProfilePhotoUser = ({ userId, data }: PostProfilePhotoUserParams) =>
  apiClient
    .post<boolean>(`/users/${userId}/profile-photo`, data)
    .then((response) => {
      handleResponseSuccess(response.data, 'Foto atualizada com sucesso!')();
    })
    .catch(handleResponseThrowError());

type PostProfilePhotoUserData = Awaited<
  ReturnType<typeof postProfilePhotoUser>
>;

export const usePostProfilePhotoUser = ({
  onSuccess,
  ...options
}: MutationOptions<PostProfilePhotoUserData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postProfilePhotoUser,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
