export const GET_LOGS = 'GET_LOGS';

/** Janelas do filtro de tempo. A tela abre em 24 horas. */
export const PERIOD_OPTIONS = [
  { value: 24, label: 'Últimas 24 horas', short: '24 horas' },
  { value: 24 * 7, label: 'Últimos 7 dias', short: '7 dias' },
  { value: 24 * 30, label: 'Últimos 30 dias', short: '30 dias' },
];

export const DEFAULT_PERIOD_HOURS = 24;

/** Ação executada, para o filtro. Os rótulos batem com os que a API devolve. */
export const ACTION_OPTIONS = [
  { value: 'create', label: 'Criou' },
  { value: 'createMany', label: 'Criou em lote' },
  { value: 'update', label: 'Alterou' },
  { value: 'updateMany', label: 'Alterou em lote' },
  { value: 'delete', label: 'Removeu' },
  { value: 'deleteMany', label: 'Removeu em lote' },
  { value: 'upsert', label: 'Criou ou alterou' },
];

/** Tabela afetada. Espelha o MODEL_LABELS do backend (src/logs/log-labels.ts) */
export const MODEL_OPTIONS = [
  { value: 'User', label: 'Cadastro' },
  { value: 'Payment', label: 'Pagamento' },
  { value: 'PaymentCheckout', label: 'Cobrança' },
  { value: 'Event', label: 'Evento' },
  { value: 'EventOnUsers', label: 'Inscrição no evento' },
  { value: 'EventOnUsersRolesRegistration', label: 'Inscrição por tipo' },
  { value: 'RolesRegistration', label: 'Tipo de inscrição' },
  { value: 'GroupRoles', label: 'Grupo de inscrição' },
  { value: 'Team', label: 'Equipe' },
  { value: 'TeamOnUsers', label: 'Vínculo com equipe' },
  { value: 'Bedrooms', label: 'Quarto' },
  { value: 'BedroomsOnUsers', label: 'Alocação em quarto' },
  { value: 'Checkin', label: 'Check-in' },
  { value: 'News', label: 'Notícia' },
  { value: 'NewsOnEvents', label: 'Envio de notícia (evento)' },
  { value: 'NewsOnGroupRoles', label: 'Envio de notícia (grupo)' },
  { value: 'Waitlist', label: 'Lista de espera' },
  { value: 'Discounts', label: 'Desconto' },
  { value: 'UserToken', label: 'Código de redefinição' },
];

/** Cor do chip por família de ação: criar, alterar e remover */
export const ACTION_CHIP_TONE: Record<string, 'success' | 'info' | 'error'> = {
  create: 'success',
  createMany: 'success',
  update: 'info',
  updateMany: 'info',
  upsert: 'info',
  delete: 'error',
  deleteMany: 'error',
};
