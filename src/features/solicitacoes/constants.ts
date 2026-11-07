import { Theme } from '@mui/material';
import {
  AccountBalanceWalletOutlined,
  CheckCircleOutline,
  Church,
  HighlightOff,
  HourglassTop,
  PendingActions,
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

export const ROTULO_DO_STATUS: Record<StatusDaSolicitacao, string> = {
  REQUESTED: 'Solicitado',
  IN_REVIEW: 'Em análise',
  AWAITING_TREASURY: 'Aguardando tesouraria',
  AWAITING_PASTOR: 'Aguardando pastor',
  ACCEPTED: 'Aceito',
  PARTIALLY_ACCEPTED: 'Aceito parcialmente',
  REJECTED: 'Recusado',
};

/** O ícone de cada situação (as abas do painel) */
export const ICONE_DO_STATUS: Record<StatusDaSolicitacao, SvgIconComponent> = {
  REQUESTED: Schedule,
  IN_REVIEW: HourglassTop,
  AWAITING_TREASURY: AccountBalanceWalletOutlined,
  AWAITING_PASTOR: Church,
  ACCEPTED: CheckCircleOutline,
  PARTIALLY_ACCEPTED: Rule,
  REJECTED: HighlightOff,
};

/**
 * As abas do painel: as situações agrupadas por etapa do trâmite. Uma aba por
 * situação davam oito, e os rótulos longos ("Aguardando tesouraria") quebravam
 * em duas linhas; a situação exata segue no chip de cada linha da lista.
 */
export const ETAPAS: {
  valor: string;
  rotulo: string;
  Icone: SvgIconComponent;
  situacoes: StatusDaSolicitacao[];
}[] = [
  {
    valor: 'novas',
    rotulo: 'Novas',
    Icone: Schedule,
    situacoes: ['REQUESTED', 'IN_REVIEW'],
  },
  {
    valor: 'em-aprovacao',
    rotulo: 'Em aprovação',
    Icone: PendingActions,
    situacoes: ['AWAITING_TREASURY', 'AWAITING_PASTOR'],
  },
  {
    valor: 'aceitas',
    rotulo: 'Aceitas',
    Icone: CheckCircleOutline,
    situacoes: ['ACCEPTED', 'PARTIALLY_ACCEPTED'],
  },
  {
    valor: 'recusadas',
    rotulo: 'Recusadas',
    Icone: HighlightOff,
    situacoes: ['REJECTED'],
  },
];

/** A igreja já respondeu: aceita, aceita em parte ou recusada */
export const RESPONDIDA: Record<StatusDaSolicitacao, boolean> = {
  REQUESTED: false,
  IN_REVIEW: false,
  AWAITING_TREASURY: false,
  AWAITING_PASTOR: false,
  ACCEPTED: true,
  PARTIALLY_ACCEPTED: true,
  REJECTED: true,
};

/**
 * A cor do chip de cada situação, das cores de estado do tema. A parcial não
 * tem cor no tema: é um verde-azulado (perto do verde de aceito, sem se
 * confundir com ele), com o tom do claro e o do escuro, no contraste dos
 * outros chips. As duas de "aguardando" usam a de pendente: falta alguém.
 */
export const corDoStatus = (theme: Theme, status: StatusDaSolicitacao) =>
  ({
    REQUESTED: theme.palette.chips.info,
    IN_REVIEW: theme.palette.chips.alert,
    AWAITING_TREASURY: theme.palette.chips.pending,
    AWAITING_PASTOR: theme.palette.chips.pending,
    ACCEPTED: theme.palette.chips.success,
    PARTIALLY_ACCEPTED: theme.palette.mode === 'dark' ? '#2DD4BF' : '#0E7C74',
    REJECTED: theme.palette.chips.canceled,
  })[status];
