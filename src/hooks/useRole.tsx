import {
  ADMIN_AREA_ROLES,
  ADMIN_ROLES,
  Role,
  SUPER_ADMIN_ROLES,
} from '../constants/roles';
import { getStoredUser } from '../auth/session';

type RoleInfo = {
  role: number | null;
  /** Dev, super admin ou admin: acesso irrestrito ao painel */
  isAdmin: boolean;
  /** Tem poder de super admin — o dev entra aqui de propósito */
  isSuperAdmin: boolean;
  /** Perfil interno de desenvolvimento; só ele concede o próprio perfil */
  isDev: boolean;
  isFinance: boolean;
  /** Entra no painel administrativo (inclui o financeiro) */
  canAccessAdminArea: boolean;
};

function useRole(): RoleInfo {
  const role = getStoredUser()?.role ?? null;

  // Retorna informações sobre o papel do usuário, incluindo se ele é admin, super admin, financeiro e se pode acessar a área administrativa.
  // isAdmin: true se o usuário for dev, super admin ou admin, false caso contrário.
  // isSuperAdmin: true para quem tem poder de super admin (inclui o dev).
  // isDev: true só para o perfil interno de desenvolvimento.
  // isFinance: true se o usuário for financeiro, false caso contrário.
  // canAccessAdminArea: true se o usuário tiver acesso à área administrativa, false caso contrário.

  return {
    role,
    isAdmin: role !== null && ADMIN_ROLES.includes(role),
    isSuperAdmin: role !== null && SUPER_ADMIN_ROLES.includes(role),
    isDev: role === Role.DEV,
    isFinance: role === Role.FINANCE,
    canAccessAdminArea: role !== null && ADMIN_AREA_ROLES.includes(role),
  };
}

export { useRole };
