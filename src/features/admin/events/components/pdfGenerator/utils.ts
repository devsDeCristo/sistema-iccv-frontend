import { User } from '../../../../../types/user';
import { PdfSection } from '../../../../../types/pdf';
import { PdfGroupBy } from './types';

export const NO_TEAM = 'Sem equipe';
export const NO_REGISTRATION_GROUP = 'Sem grupo de inscrição';

const names = (items?: { name: string }[]) =>
  (items ?? []).map((item) => item?.name).filter(Boolean) as string[];

/** Nomes das equipes de um usuário, como vêm na listagem de inscritos */
export const userTeamNames = (user: User) => names(user.teams);

/** Nomes dos grupos de inscrição de um usuário */
export const userGroupNames = (user: User) => names(user.groupsRegistration);

/** Inscritos de qualquer uma das equipes marcadas */
export function filterByTeams(users: User[], teams: string[]): User[] {
  if (teams.length === 0) return [];
  return users.filter((user) =>
    userTeamNames(user).some((name) => teams.includes(name))
  );
}

/** Inscritos de qualquer um dos grupos de inscrição marcados */
export function filterByGroups(users: User[], groups: string[]): User[] {
  if (groups.length === 0) return [];
  return users.filter((user) =>
    userGroupNames(user).some((name) => groups.includes(name))
  );
}

const byName = (a: User, b: User) =>
  (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR');

/** Chave do bloco; um usuário entra em um bloco só, o primeiro que ele tem */
function sectionKey(user: User, groupBy: PdfGroupBy): string {
  if (groupBy === 'team') return userTeamNames(user)[0] ?? NO_TEAM;
  if (groupBy === 'registrationGroup')
    return userGroupNames(user)[0] ?? NO_REGISTRATION_GROUP;
  return '';
}

/**
 * Monta os blocos do PDF. Sem agrupamento sai um bloco único sem cabeçalho;
 * com agrupamento os blocos saem em ordem alfabética de título.
 */
export function buildSections(
  users: User[],
  groupBy: PdfGroupBy,
  alphabetical: boolean
): PdfSection[] {
  const sort = (list: User[]) =>
    alphabetical ? [...list].sort(byName) : [...list];

  if (groupBy === 'none') {
    return [{ title: null, users: sort(users) }];
  }

  const buckets = new Map<string, User[]>();
  for (const user of users) {
    const key = sectionKey(user, groupBy);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(user);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([title, groupUsers]) => ({ title, users: sort(groupUsers) }));
}
