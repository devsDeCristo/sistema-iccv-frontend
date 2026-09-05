import {
  ADMIN_AREA_ROLES,
  ADMIN_ROLES,
  Role,
  SUPER_ADMIN_ROLES,
} from '../constants/roles';
import { getStoredUser } from '../auth/session';
import { ChurchRole } from '../types/user';

type Igreja = { id: string; name: string };

type RoleInfo = {
  /** Perfil efetivo: o mais alto entre os vínculos, ou super admin/usuário */
  role: number | null;
  /** Dev, super admin ou admin (em alguma igreja): acesso irrestrito ao painel */
  isAdmin: boolean;
  /** Tem poder de super admin — o dev entra aqui de propósito */
  isSuperAdmin: boolean;
  /** Perfil interno de desenvolvimento; só ele concede o próprio perfil */
  isDev: boolean;
  isFinance: boolean;
  /** Entra no painel administrativo (inclui o financeiro) */
  canAccessAdminArea: boolean;
  /** Vínculos: o perfil que a pessoa tem em cada igreja */
  churchRoles: ChurchRole[];
  /** Igrejas que ela administra — as que pode escolher ao criar coisas */
  igrejasQueAdministra: Igreja[];
  /** Perfil dela numa igreja específica, ou null se não administra lá */
  perfilNaIgreja: (churchId: string) => number | null;
};

/**
 * Quem é a pessoa logada, do ponto de vista de permissão.
 *
 * `role` continua respondendo "ela alcança esta tela?" — é o perfil efetivo,
 * calculado no backend a partir dos vínculos. `churchRoles` responde o resto:
 * em qual igreja ela é admin e em qual é financeiro, já que pode ser as duas
 * coisas em igrejas diferentes.
 */
function useRole(): RoleInfo {
  const stored = getStoredUser();
  const role = stored?.role ?? null;
  const churchRoles = stored?.churchRoles ?? [];

  return {
    role,
    isAdmin: role !== null && ADMIN_ROLES.includes(role),
    isSuperAdmin: role !== null && SUPER_ADMIN_ROLES.includes(role),
    isDev: role === Role.DEV,
    isFinance: role === Role.FINANCE,
    canAccessAdminArea: role !== null && ADMIN_AREA_ROLES.includes(role),
    churchRoles,
    igrejasQueAdministra: churchRoles
      .filter((vinculo) => vinculo.role === Role.ADMIN)
      .map((vinculo) => vinculo.church),
    perfilNaIgreja: (churchId: string) =>
      churchRoles.find((vinculo) => vinculo.church.id === churchId)?.role ??
      null,
  };
}

export { useRole };
