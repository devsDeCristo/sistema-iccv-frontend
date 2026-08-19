import {
  formatCPF,
  formatDate,
  formatPhoneNumber,
} from '../../../../../utils';
import {
  ExportColumn,
  ExportGrouping,
  ExportOrientation,
  ExportSort,
  PdfTemplate,
} from './types';

const yesNo = (value?: boolean) => (value ? 'Sim' : 'Não');
const listNames = (items?: { name: string }[]) =>
  (items ?? []).map((item) => item.name).join(', ');

/**
 * Catálogo com todos os dados disponíveis do usuário, não só os visíveis na
 * grade. A ordem aqui é a ordem em que as colunas saem no arquivo.
 */
export const EXPORT_COLUMNS: ExportColumn[] = [
  {
    field: 'fullName',
    label: 'Nome completo',
    getValue: (user) => user.fullName ?? '',
  },
  {
    field: 'badgeName',
    label: 'Nome do crachá',
    getValue: (user) => user.badgeName ?? '',
  },
  { field: 'cpf', label: 'CPF', getValue: (user) => formatCPF(user.cpf ?? '') },
  {
    field: 'birthday',
    label: 'Data de nascimento',
    getValue: (user) => (user.birthday ? formatDate(new Date(user.birthday)) : ''),
  },
  { field: 'email', label: 'E-mail', getValue: (user) => user.email ?? '' },
  {
    field: 'cellphone',
    label: 'Celular',
    getValue: (user) =>
      user.cellphone ? formatPhoneNumber(user.cellphone) : '',
  },
  {
    field: 'emergencyContact',
    label: 'Contato de emergência',
    getValue: (user) =>
      user.emergencyContact ? formatPhoneNumber(user.emergencyContact) : '',
  },
  {
    field: 'profession',
    label: 'Profissão',
    getValue: (user) => user.profession ?? '',
  },
  { field: 'city', label: 'Cidade', getValue: (user) => user.city ?? '' },
  {
    field: 'neighborhood',
    label: 'Bairro',
    getValue: (user) => user.neighborhood ?? '',
  },
  { field: 'state', label: 'Estado', getValue: (user) => user.state ?? '' },
  {
    field: 'religion',
    label: 'Religião',
    getValue: (user) => user.religion ?? '',
  },
  {
    field: 'leadershipPosition',
    label: 'Cargo na igreja',
    getValue: (user) => user.leadershipPosition ?? '',
  },
  {
    field: 'indicatedBy',
    label: 'Indicado por',
    getValue: (user) => user.indicatedBy ?? '',
  },
  {
    field: 'diabetes',
    label: 'Diabetes',
    getValue: (user) => yesNo(user.diabetes),
  },
  {
    field: 'hypertensive',
    label: 'Hipertensão',
    getValue: (user) => yesNo(user.hypertensive),
  },
  {
    field: 'notes',
    label: 'Observações',
    getValue: (user) => user.notes ?? '',
  },
  {
    field: 'groupsRegistration',
    label: 'Grupo de inscrição',
    getValue: (user) => listNames(user.groupsRegistration),
  },
  {
    field: 'teams',
    label: 'Equipe',
    getValue: (user) => listNames(user.teams),
  },
  {
    field: 'roleTeam',
    label: 'Função na equipe',
    getValue: (user) =>
      user.roleTeam === 'LEADER'
        ? 'Líder'
        : user.roleTeam === 'MEMBER'
        ? 'Membro'
        : '',
  },
  {
    field: 'bedrooms',
    label: 'Quarto',
    getValue: (user) => listNames(user.bedrooms),
  },
  {
    field: 'registeredAt',
    label: 'Data de inscrição',
    getValue: (user) =>
      user.registeredAt ? formatDate(new Date(user.registeredAt)) : '',
  },
];

/** Colunas marcadas quando o usuário abre o modal sem escolher um modelo */
export const DEFAULT_EXPORT_COLUMNS = [
  'fullName',
  'badgeName',
  'cpf',
  'cellphone',
  'groupsRegistration',
  'teams',
];

export const GROUPING_OPTIONS: { value: ExportGrouping; label: string }[] = [
  { value: 'none', label: 'Nenhum' },
  { value: 'team', label: 'Por equipe' },
  { value: 'bedroom', label: 'Por quarto' },
  { value: 'registrationGroup', label: 'Por grupo de inscrição' },
];

export const ORIENTATION_OPTIONS: {
  value: ExportOrientation;
  label: string;
}[] = [
  { value: 'landscape', label: 'Horizontal' },
  { value: 'portrait', label: 'Vertical' },
];

export const SORT_OPTIONS: { value: ExportSort; label: string }[] = [
  { value: 'alphabetical', label: 'Ordem alfabética' },
  { value: 'registration', label: 'Ordem de inscrição' },
];

export const ALL_GROUPS = 'todos';

export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: 'byTeam',
    label: 'PDF por equipe',
    description:
      'Agrupa por equipe, com o líder primeiro, e traz contato, quarto e dados de saúde.',
    grouping: 'team',
    sort: 'alphabetical',
    columns: [
      'fullName',
      'badgeName',
      'cellphone',
      'bedrooms',
      'diabetes',
      'hypertensive',
      'notes',
    ],
  },
  {
    id: 'general',
    label: 'PDF geral',
    description: 'Lista corrida de todos os inscritos com nome e telefone.',
    grouping: 'none',
    sort: 'alphabetical',
    columns: ['fullName', 'cellphone'],
  },
  {
    id: 'birthdays',
    label: 'Lista de aniversariantes',
    description:
      'Só quem faz aniversário nos meses do evento, com equipe e data.',
    grouping: 'none',
    sort: 'alphabetical',
    columns: ['fullName', 'badgeName', 'teams', 'birthday'],
    onlyBirthdaysInEventMonths: true,
  },
];

export const CUSTOM_TEMPLATE_ID = 'custom';
