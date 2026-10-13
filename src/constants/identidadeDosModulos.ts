import { ElementType } from 'react';
import { Theme } from '@mui/material';
import {
  AccountBalanceWallet,
  Campaign,
  Diversity3,
  Event,
} from '@mui/icons-material';

/** Os módulos que a home apresenta e cujas telas levam a identidade deles */
export type ChaveDoModulo = 'membros' | 'eventos' | 'noticias' | 'tesouraria';

/**
 * O ícone de cada módulo — o mesmo no card da home e no cabeçalho da tela
 * dele, para a pessoa reconhecer de relance onde está.
 */
export const ICONE_DO_MODULO: Record<ChaveDoModulo, ElementType> = {
  membros: Diversity3,
  eventos: Event,
  noticias: Campaign,
  tesouraria: AccountBalanceWallet,
};

/** A cor de cada módulo, da paleta de chips do tema (claro e escuro) */
export const corDoModulo = (theme: Theme, chave: ChaveDoModulo) =>
  ({
    membros: theme.palette.chips.info,
    eventos: theme.palette.chips.success,
    noticias: theme.palette.chips.pending,
    tesouraria: theme.palette.chips.alert,
  })[chave];
