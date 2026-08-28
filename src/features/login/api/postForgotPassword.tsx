import { MutationOptions, useMutation } from 'react-query';
import axios from 'axios';
import { API_URL } from '../../../config/env';
import { handleResponseThrowError } from '../../../utils/service';

type ForgotPasswordParams = { document: string };

/**
 * Etapa 1 da redefinição. A resposta é sempre a mesma, exista ou não cadastro
 * para o CPF — quem chama não descobre quem é cadastrado.
 */
const postForgotPassword = (data: ForgotPasswordParams) =>
  axios
    .post<{ message: string }>(`${API_URL}/auth/password/forgot`, data)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type PostForgotPasswordData = Awaited<ReturnType<typeof postForgotPassword>>;

export const usePostForgotPassword = ({
  onSuccess,
  ...options
}: MutationOptions<
  PostForgotPasswordData,
  unknown,
  ForgotPasswordParams
> = {}) => {
  return useMutation({
    mutationFn: postForgotPassword,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
