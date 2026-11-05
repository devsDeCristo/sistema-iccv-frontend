import { Theme } from '@mui/material';
import {
  CheckCircleOutline,
  HighlightOff,
  HourglassTop,
  Rule,
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
  'PARTIALLY_ACCEPTED',
  'REJECTED',
];

export const ROTULO_DO_STATUS: Record<StatusDaSolicitacao, string> = {
  REQUESTED: 'Solicitado',
  IN_REVIEW: 'Em análise',
  ACCEPTED: 'Aceito',
  PARTIALLY_ACCEPTED: 'Aceito parcialmente',
  REJECTED: 'Recusado',
};

/** O ícone de cada situação (as abas do painel) */
export const ICONE_DO_STATUS: Record<StatusDaSolicitacao, SvgIconComponent> = {
  REQUESTED: Schedule,
  IN_REVIEW: HourglassTop,
  ACCEPTED: CheckCircleOutline,
  PARTIALLY_ACCEPTED: Rule,
  REJECTED: HighlightOff,
};

/** A igreja já respondeu: aceita, aceita em parte ou recusada */
export const RESPONDIDA: Record<StatusDaSolicitacao, boolean> = {
  REQUESTED: false,
  IN_REVIEW: false,
  ACCEPTED: true,
  PARTIALLY_ACCEPTED: true,
  REJECTED: true,
};

/**
 * A cor do chip de cada situação, das cores de estado do tema. A parcial não
 * tem cor no tema: é um verde-azulado (perto do verde de aceito, sem se
 * confundir com ele), com o tom do claro e o do escuro, no contraste dos
 * outros chips.
 */
export const corDoStatus = (theme: Theme, status: StatusDaSolicitacao) =>
  ({
    REQUESTED: theme.palette.chips.info,
    IN_REVIEW: theme.palette.chips.alert,
    ACCEPTED: theme.palette.chips.success,
    PARTIALLY_ACCEPTED: theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E7C74',
    REJECTED: theme.palette.chips.canceled,
  })[status];
