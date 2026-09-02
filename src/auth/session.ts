import { AxiosError } from 'axios';
import { User } from '../types/user';

/**
 * Fim de sessão em um só lugar. O interceptor do axios, os loaders de rota e o
 * botão "Sair" precisam limpar as mesmas chaves e mandar para o mesmo destino —
 * antes cada um fazia do seu jeito, e o `localStorage.clear()` do logout
 * levava embora até o tema escolhido.
 */

/** só o que é da sessão: `theme` é preferência do aparelho e sobrevive ao logout */
const SESSION_KEYS = ['access_token', 'user', 'cpf'];

const REDIRECT_KEY = 'post_login_redirect';
const EXPIRED_KEY = 'session_expired';

/** telas de quem não está logado: não são destino de volta depois do login */
const PUBLIC_PATHS = ['/login', '/usuario/cadastrar'];

/** rotas que só existem para quem entra no painel administrativo */
const ADMIN_PATHS = ['/admin', '/configuracoes'];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
}

export function isAdminPath(path: string) {
  return ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath));
}

export function getStoredUser(): User | null {
  const storedUser = localStorage.getItem('user');

  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Erro ao parsear o JSON do usuário:', error);
    return null;
  }
}

/**
 * Grava o perfil da sessão. Os loaders de rota chamam isto com a resposta do
 * `/auth/validate`: é o que mantém `role` e `churchRoles` em dia sem obrigar a
 * pessoa a sair e entrar de novo quando o vínculo dela muda.
 */
export function setStoredUser(user: Partial<User> | null) {
  if (!user) return;

  // mescla em vez de substituir: o `/auth/validate` devolve só o que interessa
  // à permissão, e trocar o objeto inteiro apagaria os campos de perfil que o
  // login guardou e outras telas leem
  const atual = getStoredUser() ?? {};

  localStorage.setItem('user', JSON.stringify({ ...atual, ...user }));
}

export function hasSession() {
  return !!localStorage.getItem('access_token');
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

/**
 * 401 e 403 são resposta do servidor sobre a sessão. Falha de rede e 5xx não
 * dizem nada sobre o token — tratar as duas coisas igual era o que derrubava a
 * sessão de quem só tinha pegado o backend fora do ar.
 */
export function isAuthError(error: unknown) {
  const status = (error as AxiosError)?.response?.status;

  return status === 401 || status === 403;
}

/** guarda onde a pessoa estava para o login devolvê-la ao mesmo lugar */
export function rememberRoute(route: string) {
  if (!route || isPublicPath(route)) return;

  sessionStorage.setItem(REDIRECT_KEY, route);
}

/** lê e consome a rota guardada: ela só vale para o próximo login */
export function takeRememberedRoute(): string | null {
  const route = sessionStorage.getItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);

  if (!route || isPublicPath(route)) return null;

  return route;
}

/** o login lê isso para explicar por que a pessoa voltou para lá */
export function takeSessionExpired() {
  const expired = sessionStorage.getItem(EXPIRED_KEY);
  sessionStorage.removeItem(EXPIRED_KEY);

  return expired === '1';
}

let ending = false;

/**
 * Sessão vencida: limpa, guarda a rota e leva ao login.
 *
 * A trava existe porque uma tela dispara várias requisições ao mesmo tempo e
 * todas levam 401 juntas — sem ela seriam N redirects. Ela não precisa ser
 * desfeita: o `assign` recarrega a aplicação e o módulo nasce de novo.
 */
export function endSession() {
  if (ending) return;
  ending = true;

  const { pathname, search } = window.location;

  rememberRoute(`${pathname}${search}`);
  sessionStorage.setItem(EXPIRED_KEY, '1');
  clearSession();

  // recarga proposital: garante que cache do react-query, contexto de usuário
  // e estado das telas não atravessem a troca de sessão
  window.location.assign('/login');
}
