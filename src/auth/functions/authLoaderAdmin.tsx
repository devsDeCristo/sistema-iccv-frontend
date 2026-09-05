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

export async function authLoaderAdmin({ request }: LoaderFunctionArgs) {
  try {
    const { data } = await apiClient.get('/auth/admin/validate');
    // a resposta é a versão atual do perfil: guardá-la aqui é o que faz uma
    // mudança de vínculo valer na navegação seguinte, e não só no próximo login
    setStoredUser(data);
    return data;
  } catch (error) {
    if (!isAuthError(error)) {
      // erro temporário (rede, 5xx): não é a sessão que caiu
      return getStoredUser();
    }

    /**
     * `/auth/admin/validate` responde 401 tanto para token inválido quanto
     * para usuário sem acesso ao painel. Uma segunda pergunta separa os dois:
     * se a sessão vale, o problema é só de permissão, e a pessoa vai para a
     * área dela — deslogar quem tem sessão boa era o efeito colateral antigo.
     */
    const sessionInvalid = await apiClient
      .get('/auth/validate')
      .then(() => false)
      .catch((validateError) => isAuthError(validateError));

    if (!sessionInvalid) return redirect('/home');

    const { pathname, search } = new URL(request.url);

    clearSession();
    rememberRoute(`${pathname}${search}`);

    return redirect('/login');
  }
}
