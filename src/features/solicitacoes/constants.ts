import { Theme } from '@mui/material';
import {
  CheckCircleOutline,
  HighlightOff,
  HourglassTop,
  Schedule,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { StatusDaSolicitacao } from './types';

/**
 * Os ministérios que pedem. A API tem a mesma lista (`MINISTERIOS` em
 * `src/solicitacoes/solicitacoes.dto.ts`) e recusa o que estiver fora dela.
 */
export const MINISTERIOS = [
  'Louvor',
  'Mídia',
  'Som e iluminação',
  'Infantil',
  'Jovens',
  'Recepção',
  'Intercessão',
  'Ação social',
  'Diaconia',
  'Ensino',
  'Casais',
  'Outro',
] as const;

/** Na ordem em que o pedido anda */
export const STATUS: StatusDaSolicitacao[] = [
  'REQUESTED',
  'IN_REVIEW',
  'ACCEPTED',
  'REJECTED',
];

export const ROTULO_DO_STATUS: Record<StatusDaSolicitacao, string> = {
  REQUESTED: 'Solicitado',
  IN_REVIEW: 'Em análise',
  ACCEPTED: 'Aceito',
  REJECTED: 'Recusado',
};

/** O ícone de cada situação (as abas do painel) */
export const ICONE_DO_STATUS: Record<StatusDaSolicitacao, SvgIconComponent> = {
  REQUESTED: Schedule,
  IN_REVIEW: HourglassTop,
  ACCEPTED: CheckCircleOutline,
  REJECTED: HighlightOff,
};

/** A cor do chip de cada situação, das cores de estado do tema */
export const corDoStatus = (theme: Theme, status: StatusDaSolicitacao) =>
  ({
    REQUESTED: theme.palette.chips.info,
    IN_REVIEW: theme.palette.chips.alert,
    ACCEPTED: theme.palette.chips.success,
    REJECTED: theme.palette.chips.canceled,
  })[status];
