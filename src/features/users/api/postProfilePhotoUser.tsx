import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';

const postProfilePhotoUser = (data: any) =>
  apiClient
    .post<boolean>(
      '/users/6e893017-aec6-4d16-a816-4789c8d23333/profile-photo',
      data
    )
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
