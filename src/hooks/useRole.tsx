import {
  ADMIN_AREA_ROLES,
  ADMIN_ROLES,
  Role,
  SUPER_ADMIN_ROLES,
} from '../constants/roles';
import { getStoredUser } from '../auth/session';
import { AdminDeEvento, ChurchRole, TesoureiroDeEvento } from '../types/user';

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
  isTesouraria: boolean;
  /**
   * Entra no painel administrativo (inclui a tesouraria e quem é tesoureiro
   * ou admin de evento)
   */
  canAccessAdminArea: boolean;
  /** Os eventos em que é tesoureira (`EventTreasurer`) */
  eventTreasurers: TesoureiroDeEvento[];
  /** Os eventos de que é admin (`EventAdmin`) */
  eventAdmins: AdminDeEvento[];
  /**
   * Entra no painel só por vínculos de evento (tesoureiro ou admin), sem
   * trabalhar em igreja nenhuma: não tem Início nem Meus planos
   */
  soPorEvento: boolean;
  /** É admin deste evento (sem ser admin da igreja)? */
  adminDoEvento: (eventId: string) => boolean;
  /**
   * Só tesoureiro(a) de evento: entra no painel, mas não trabalha em igreja
   * nenhuma — vê os eventos dele e nada mais
   */
  soTesoureiroDeEvento: boolean;
  /** É tesoureiro completo em algum evento: vê Tesouraria › Eventos */
  temTesoureiroCompleto: boolean;
  /** O tipo do vínculo de tesoureiro neste evento, ou null */
  tesoureiroDoEvento: (eventId: string) => TesoureiroDeEvento['kind'] | null;
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
 * em qual igreja ela é admin e em qual é tesouraria, já que pode ser as duas
 * coisas em igrejas diferentes.
 */
function useRole(): RoleInfo {
  const stored = getStoredUser();
  const role = stored?.role ?? null;
  const churchRoles = stored?.churchRoles ?? [];
  const eventTreasurers = stored?.eventTreasurers ?? [];
  const eventAdmins = stored?.eventAdmins ?? [];
  const noPainelPeloPerfil = role !== null && ADMIN_AREA_ROLES.includes(role);
  const porEvento = eventTreasurers.length > 0 || eventAdmins.length > 0;

  return {
    role,
    isAdmin: role !== null && ADMIN_ROLES.includes(role),
    isSuperAdmin: role !== null && SUPER_ADMIN_ROLES.includes(role),
    isDev: role === Role.DEV,
    isTesouraria: role === Role.TESOURARIA,
    canAccessAdminArea: noPainelPeloPerfil || porEvento,
    eventTreasurers,
    eventAdmins,
    soPorEvento: !noPainelPeloPerfil && porEvento,
    adminDoEvento: (eventId: string) =>
      eventAdmins.some((a) => a.eventId === eventId),
    soTesoureiroDeEvento: !noPainelPeloPerfil && eventTreasurers.length > 0,
    temTesoureiroCompleto: eventTreasurers.some((t) => t.kind === 'COMPLETO'),
    tesoureiroDoEvento: (eventId: string) =>
      eventTreasurers.find((t) => t.eventId === eventId)?.kind ?? null,
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
