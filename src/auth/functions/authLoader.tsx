// src/routes/authLoader.ts
import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { apiClient } from '../../config/lib/axios/api-client';
import {
  clearSession,
  getStoredUser,
  isAuthError,
  rememberRoute,
  setStoredUser,
} from '../session';

export async function authLoader({ request }: LoaderFunctionArgs) {
  try {
    const { data } = await apiClient.get('/auth/validate');
    // a resposta é a versão atual do perfil: guardá-la aqui é o que faz uma
    // mudança de vínculo valer na navegação seguinte, e não só no próximo login
    setStoredUser(data);
    return data;
  } catch (error) {
    if (!isAuthError(error)) {
      // rede fora do ar ou 5xx não dizem que a sessão morreu: segue com o
      // usuário que já está no storage em vez de derrubar quem estava logado
      return getStoredUser();
    }

    const { pathname, search } = new URL(request.url);

    clearSession();
    rememberRoute(`${pathname}${search}`);

    // interrompe o carregamento e leva ao login
    return redirect('/login');
  }
}
