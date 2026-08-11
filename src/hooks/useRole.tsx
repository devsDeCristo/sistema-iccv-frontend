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

  return {
    role,
    isAdmin: role !== null && ADMIN_ROLES.includes(role),
    isSuperAdmin: role === Role.SUPER_ADMIN,
    isFinance: role === Role.FINANCE,
    canAccessAdminArea: role !== null && ADMIN_AREA_ROLES.includes(role),
  };
}

export { useRole };
