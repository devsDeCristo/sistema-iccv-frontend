import { MutationOptions, useMutation } from 'react-query';
import axios from 'axios';
import { API_URL } from '../../../config/env';
import { handleResponseThrowError } from '../../../utils/service';

type ResetPasswordParams = { ticket: string; password: string };

/**
 * Etapa 3. Grava a senha nova e encerra o processo — o ticket morre aqui e não
 * há login automático: o usuário entra de novo pela tela de login.
 */
const postResetPassword = (data: ResetPasswordParams) =>
  axios
    .post<{ message: string }>(`${API_URL}/auth/password/reset`, data)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type PostResetPasswordData = Awaited<ReturnType<typeof postResetPassword>>;

export const usePostResetPassword = ({
  onSuccess,
  ...options
}: MutationOptions<
  PostResetPasswordData,
  unknown,
  ResetPasswordParams
> = {}) => {
  return useMutation({
    mutationFn: postResetPassword,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
