import { Team } from '../../types';
import { User } from '../../../../../types/user';
import { ALL_GROUPS, EXPORT_COLUMNS } from './constants';
import {
  ExportColumn,
  ExportGroup,
  ExportGrouping,
  ExportSort,
  ExportUser,
} from './types';

const NO_TEAM = 'Sem equipe';
const NO_BEDROOM = 'Sem quarto';
const NO_GROUP = 'Sem grupo de inscrição';

/**
 * A listagem de inscritos não traz a função na equipe; ela só existe na query
 * de equipes. Aqui os dois são cruzados por id de usuário.
 */
export function withTeamRole(users: User[], teams: Team[]): ExportUser[] {
  const roleByUser = new Map<string, 'LEADER' | 'MEMBER'>();

  for (const team of teams ?? []) {
    for (const member of team.users ?? []) {
      if (member?.id && member.roleTeam) {
        roleByUser.set(member.id, member.roleTeam);
      }
    }
  }

  return (users ?? []).map((user) => ({
    ...user,
    roleTeam: roleByUser.get(user.id),
  }));
}

export function getColumns(fields: string[]): ExportColumn[] {
  // percorre o catálogo (e não os fields) para manter a ordem canônica
  return EXPORT_COLUMNS.filter((column) => fields.includes(column.field));
}

/** Meses (1-12) cobertos pelo evento, para a lista de aniversariantes */
export function getEventMonths(startDate?: Date, endDate?: Date): number[] {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = new Set<number>();

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor <= end) {
    months.add(cursor.getMonth() + 1);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Array.from(months);
}

export function filterByBirthdayMonths(
  users: ExportUser[],
  months: number[]
): ExportUser[] {
  if (months.length === 0) return users;

  return users.filter((user) => {
    if (!user.birthday) return false;
    return months.includes(new Date(user.birthday).getMonth() + 1);
  });
}

export function filterByRegistrationGroup(
  users: ExportUser[],
  groupName: string
): ExportUser[] {
  if (!groupName || groupName === ALL_GROUPS) return users;

  return users.filter((user) =>
    (user.groupsRegistration ?? []).some(
      (group: any) => group?.name === groupName
    )
  );
}

const byName = (a: ExportUser, b: ExportUser) =>
  (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR');

const byRegistration = (a: ExportUser, b: ExportUser) => {
  const aTime = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
  const bTime = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
  return aTime - bTime;
};

function sortUsers(
  users: ExportUser[],
  sort: ExportSort,
  leadersFirst: boolean
): ExportUser[] {
  const compare = sort === 'registration' ? byRegistration : byName;

  return [...users].sort((a, b) => {
    if (leadersFirst) {
      const aLeader = a.roleTeam === 'LEADER' ? 0 : 1;
      const bLeader = b.roleTeam === 'LEADER' ? 0 : 1;
      if (aLeader !== bLeader) return aLeader - bLeader;
    }
    return compare(a, b);
  });
}

const firstName = (items?: { name: string }[], fallback = '') =>
  items?.[0]?.name ?? fallback;

/** Chave de agrupamento de um usuário; um usuário entra em um bloco só */
function groupKey(user: ExportUser, grouping: ExportGrouping): string {
  switch (grouping) {
    case 'team':
      return firstName(user.teams, NO_TEAM);
    case 'bedroom':
      return firstName(user.bedrooms, NO_BEDROOM);
    case 'registrationGroup':
      return firstName(user.groupsRegistration, NO_GROUP);
    default:
      return '';
  }
}

/**
 * Líder de cada equipe pelo elenco completo vindo da query de equipes — e não
 * pelos usuários exportados, senão o líder some quando o filtro de grupo de
 * inscrição deixa ele de fora.
 */
export function buildLeaderByTeam(teams: Team[]): Map<string, string> {
  const leaderByTeam = new Map<string, string>();

  for (const team of teams ?? []) {
    const leaders = (team.users ?? [])
      .filter((member) => member?.roleTeam === 'LEADER')
      .map((member) => member.fullName)
      .filter(Boolean);

    if (leaders.length > 0) {
      leaderByTeam.set(team.name, leaders.join(', '));
    }
  }

  return leaderByTeam;
}

interface BuildGroupsOptions {
  /** acrescenta o nome do líder ao lado do nome da equipe */
  leaderByTeam?: Map<string, string>;
}

/**
 * Monta os blocos do PDF. Em "por equipe" o líder sempre vem primeiro, como
 * pede o modelo, independente da ordenação escolhida.
 */
export function buildGroups(
  users: ExportUser[],
  grouping: ExportGrouping,
  sort: ExportSort,
  { leaderByTeam }: BuildGroupsOptions = {}
): ExportGroup[] {
  const leadersFirst = grouping === 'team';

  if (grouping === 'none') {
    return [{ title: null, users: sortUsers(users, sort, false) }];
  }

  const buckets = new Map<string, ExportUser[]>();
  for (const user of users) {
    const key = groupKey(user, grouping);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(user);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([key, groupUsers]) => {
      const leader = leaderByTeam?.get(key);

      return {
        title: leader ? `${key} — Líder: ${leader}` : key,
        users: sortUsers(groupUsers, sort, leadersFirst),
      };
    });
}

/** Matriz cabeçalho + linhas, usada por CSV e XLSX */
export function buildSheetData(
  users: ExportUser[],
  columns: ExportColumn[]
): string[][] {
  return [
    columns.map((column) => column.label),
    ...users.map((user) => columns.map((column) => column.getValue(user))),
  ];
}
