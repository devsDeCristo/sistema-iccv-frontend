/**
 * Perfis de acesso. Os valores espelham `User.role` no backend
 * (src/auth/roles.ts) — não são sequenciais por histórico: 1 e 5 já existiam.
 *
 * O dev é -1, e não 0, porque 0 é falsy: os `user.role || PADRAO` que existem
 * por aqui rebaixariam o dev para usuário comum sem ninguém perceber.
 */
export enum Role {
  DEV = -1,
  SUPER_ADMIN = 1,
  ADMIN = 2,
  TESOURARIA = 3,
  USER = 5,
}

/** Perfis com poder de super admin: o dev é super admin com outro rótulo */
export const SUPER_ADMIN_ROLES = [Role.DEV, Role.SUPER_ADMIN];

/** Acesso total ao painel administrativo */
export const ADMIN_ROLES = [...SUPER_ADMIN_ROLES, Role.ADMIN];

/** Perfis que entram no painel — a tesouraria com abas restritas */
export const ADMIN_AREA_ROLES = [...ADMIN_ROLES, Role.TESOURARIA];

export const ROLE_LABELS: Record<number, string> = {
  [Role.DEV]: 'Dev',
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.TESOURARIA]: 'Tesouraria',
  [Role.USER]: 'Usuário',
};

/** Abas de detalhes do evento liberadas para a tesouraria */
export const TESOURARIA_EVENT_TABS = ['usuarios', 'pagamentos'];
