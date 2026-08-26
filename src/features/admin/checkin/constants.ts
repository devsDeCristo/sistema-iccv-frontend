import { Theme } from '@mui/material';
import { CheckinStatus } from './types';

export const GET_CHECKIN_SEARCH = 'GET_CHECKIN_SEARCH';
export const GET_CHECKIN_QUEUE = 'GET_CHECKIN_QUEUE';
export const GET_CHECKIN_STATS = 'GET_CHECKIN_STATS';

/**
 * Rede de segurança: mesmo com o WebSocket ligado as telas refazem a consulta
 * de tempos em tempos. Se o socket cair no meio do evento, a fila continua
 * andando sozinha em vez de congelar sem ninguém perceber.
 */
export const CHECKIN_REFETCH_MS = 15000;

/** As situações na ordem em que a pessoa passa por elas no evento. */
export const CHECKIN_STATUS_ORDER: CheckinStatus[] = [
  'PENDING',
  'QUEUED',
  'IN_PROGRESS',
  'DONE',
];

export const CHECKIN_STATUS_LABEL: Record<CheckinStatus, string> = {
  PENDING: 'Não chegou',
  QUEUED: 'Na fila da foto',
  IN_PROGRESS: 'Em atendimento',
  DONE: 'Check-in concluído',
};

/**
 * Cor de cada etapa, na paleta de chips do tema — a mesma que os chips do resto
 * do sistema usam.
 *
 * Antes eram as cores nomeadas do MUI (`success`, `warning`) em chip preenchido,
 * o que dava ao check-in um chip visualmente diferente de todas as outras telas.
 */
export const corDoStatusCheckin = (
  theme: Theme
): Record<CheckinStatus, string> => ({
  // pendente é estado desligado, não alerta
  PENDING: theme.palette.text.disabled,
  QUEUED: theme.palette.chips.info,
  IN_PROGRESS: theme.palette.chips.alert,
  DONE: theme.palette.chips.success,
});

/** "há 3 min" a partir do horário em que a pessoa entrou na fila */
export function esperaEmMinutos(desde?: string | null): number | null {
  if (!desde) return null;

  const inicio = new Date(desde).getTime();
  if (Number.isNaN(inicio)) return null;

  return Math.max(Math.floor((Date.now() - inicio) / 60000), 0);
}

export function horaCurta(valor?: string | null): string {
  if (!valor) return '';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
