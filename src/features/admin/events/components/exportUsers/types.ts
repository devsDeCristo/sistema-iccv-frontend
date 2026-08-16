import { User } from '../../../../../types/user';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/** De onde saem os registros exportados */
export type ExportScope = 'selected' | 'filtered' | 'all';

export type ExportGrouping =
  | 'none'
  | 'team'
  | 'bedroom'
  | 'registrationGroup';

export type ExportSort = 'alphabetical' | 'registration';

export type ExportOrientation = 'landscape' | 'portrait';

/** Usuário do evento acrescido da função na equipe, que vem da query de equipes */
export type ExportUser = User & { roleTeam?: 'LEADER' | 'MEMBER' };

export interface ExportColumn {
  field: string;
  label: string;
  getValue: (user: ExportUser) => string;
}

export interface PdfTemplate {
  id: string;
  label: string;
  description: string;
  grouping: ExportGrouping;
  sort: ExportSort;
  columns: string[];
  /** Modelo de aniversariantes: limita aos nascidos nos meses do evento */
  onlyBirthdaysInEventMonths?: boolean;
}

/** Um bloco do PDF: título do agrupamento + usuários dele */
export interface ExportGroup {
  title: string | null;
  users: ExportUser[];
}
