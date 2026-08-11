/**
 * Perfis de acesso. Os valores espelham `User.role` no backend
 * (src/auth/roles.ts) — não são sequenciais por histórico: 1 e 5 já existiam.
 */
export enum Role {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  FINANCE = 3,
  USER = 5,
}

/** Acesso total ao painel administrativo */
export const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.ADMIN];

/** Perfis que entram no painel — o financeiro com abas restritas */
export const ADMIN_AREA_ROLES = [...ADMIN_ROLES, Role.FINANCE];

export const ROLE_LABELS: Record<number, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.FINANCE]: 'Financeiro',
  [Role.USER]: 'Usuário',
};

/** Abas de detalhes do evento liberadas para o financeiro */
export const FINANCE_EVENT_TABS = ['usuarios', 'pagamentos'];
