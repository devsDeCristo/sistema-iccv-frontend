import { MutationOptions, useMutation } from 'react-query';
import axios, { AxiosError } from 'axios';
import { handleResponseThrowError } from '../../../utils/service';
import { API_URL } from '../../../config/env';

/** Entra com o ID token do botão do Google; a resposta é a mesma do login */
const postGoogleLogin = (credential: string) =>
  axios
    .post<{ access_token: string; user: any }>(`${API_URL}/auth/google`, {
      credential,
    })
    .then((response) => response.data)
    // sem cadastro vai para a tela de cadastro, com aviso próprio: sem toast
    .catch((error: AxiosError<{ semCadastro?: boolean }>) =>
      handleResponseThrowError(
        undefined,
        !error.response?.data?.semCadastro
      )(error)
    );

type PostGoogleLoginData = Awaited<ReturnType<typeof postGoogleLogin>>;

export const usePostGoogleLogin = (
  options: MutationOptions<PostGoogleLoginData, unknown, string> = {}
) => useMutation({ mutationFn: postGoogleLogin, ...options });
