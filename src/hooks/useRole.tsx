import { User } from '../types/user';
import { ADMIN_AREA_ROLES, ADMIN_ROLES, Role } from '../constants/roles';

type RoleInfo = {
  role: number | null;
  /** Super admin ou admin: acesso irrestrito ao painel */
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isFinance: boolean;
  /** Entra no painel administrativo (inclui o financeiro) */
  canAccessAdminArea: boolean;
};

function getStoredUser(): User | null {
  const localStorageUser = localStorage.getItem('user');

  try {
    return localStorageUser ? JSON.parse(localStorageUser) : null;
  } catch (error) {
    console.error('Erro ao parsear o JSON do usuário:', error);
    return null;
  }
}

function useRole(): RoleInfo {
  const role = getStoredUser()?.role ?? null;

  // Retorna informações sobre o papel do usuário, incluindo se ele é admin, super admin, financeiro e se pode acessar a área administrativa.
  // isAdmin: true se o usuário for super admin ou admin, false caso contrário.
  // isSuperAdmin: true se o usuário for super admin, false caso contrário.
  // isFinance: true se o usuário for financeiro, false caso contrário.
  // canAccessAdminArea: true se o usuário tiver acesso à área administrativa, false caso contrário.

  return {
    role,
    isAdmin: role !== null && ADMIN_ROLES.includes(role),
    isSuperAdmin: role === Role.SUPER_ADMIN,
    isFinance: role === Role.FINANCE,
    canAccessAdminArea: role !== null && ADMIN_AREA_ROLES.includes(role),
  };
}

export { useRole };
