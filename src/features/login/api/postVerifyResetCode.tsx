import { MutationOptions, useMutation } from 'react-query';
import axios from 'axios';
import { API_URL } from '../../../config/env';
import { handleResponseThrowError } from '../../../utils/service';

type VerifyResetCodeParams = { document: string; code: string };

/**
 * Etapa 2. O código confere e é trocado por um ticket de uso único: daqui em
 * diante o código não é mais usado.
 */
const postVerifyResetCode = (data: VerifyResetCodeParams) =>
  axios
    .post<{ ticket: string; expiresInMinutes: number }>(
      `${API_URL}/auth/password/verify-code`,
      data
    )
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type PostVerifyResetCodeData = Awaited<ReturnType<typeof postVerifyResetCode>>;

export const usePostVerifyResetCode = ({
  onSuccess,
  ...options
}: MutationOptions<
  PostVerifyResetCodeData,
  unknown,
  VerifyResetCodeParams
> = {}) => {
  return useMutation({
    mutationFn: postVerifyResetCode,
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...options,
  });
};
