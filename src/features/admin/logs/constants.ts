export const GET_LOGS = 'GET_LOGS';
export const GET_LOG_OPERATIONS = 'GET_LOG_OPERATIONS';
export const GET_LOGIN_ATTEMPTS = 'GET_LOGIN_ATTEMPTS';

/** As telas de log abrem nas últimas 24 horas, até agora */
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
  { value: 'FinancialEntry', label: 'Lançamento da tesouraria' },
  { value: 'Family', label: 'Família' },
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
