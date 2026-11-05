import { ElementType } from 'react';
import { Theme } from '@mui/material';
import type { CoresDoTema } from '../themes';
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

/**
 * As três cores de cada módulo, no claro e no escuro. As telas do módulo
 * abrem com elas no tema (`TemaDoModulo`): primária nos botões, foco e links;
 * secundária no ícone, no card da home e na descrição do cabeçalho; terciária
 * para pontos, selos e gráficos (nunca em texto).
 *
 * Contraste conferido contra os fundos do tema: primária 7,5:1 com o texto do
 * botão; secundária 4,5:1 no claro (sobre #F0F1F4) e 6:1 no escuro (sobre
 * #1E293B); terciária 3:1 e 4,5:1.
 */
export const CORES_DO_MODULO: Record<
  ChaveDoModulo,
  { claro: CoresDoTema; escuro: CoresDoTema }
> = {
  // Tabernáculo (Êx 26:1)
  membros: {
    claro: { primaria: '#7137A5', secundaria: '#983AE2', terciaria: '#F14787' },
    escuro: {
      primaria: '#BFA1E4',
      secundaria: '#C48EFF',
      terciaria: '#F84E8D',
    },
  },
  // Águas tranquilas (Sl 23:2)
  eventos: {
    claro: { primaria: '#005E67', secundaria: '#007A75', terciaria: '#009D61' },
    escuro: {
      primaria: '#5EBCC6',
      secundaria: '#00BAB3',
      terciaria: '#00A466',
    },
  },
  // Céus (Sl 19:1–4)
  noticias: {
    claro: { primaria: '#005793', secundaria: '#0073A7', terciaria: '#0095B2' },
    escuro: {
      primaria: '#7FB3E4',
      secundaria: '#00B0FC',
      terciaria: '#009CBA',
    },
  },
  // Trigo (Gn 41:49)
  tesouraria: {
    claro: { primaria: '#754C11', secundaria: '#8F6500', terciaria: '#BA7C16' },
    escuro: {
      primaria: '#D0A777',
      secundaria: '#D99B08',
      terciaria: '#C18220',
    },
  },
};

/** A cor que identifica o módulo (a secundária dele), no tema aberto */
export const corDoModulo = (theme: Theme, chave: ChaveDoModulo) =>
  CORES_DO_MODULO[chave][theme.palette.mode === 'dark' ? 'escuro' : 'claro']
    .secundaria;
