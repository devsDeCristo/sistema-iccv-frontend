import {
  Categoria,
  FormaDePagamento,
  OrigemDoLancamento,
  TipoDeLancamento,
} from './types';

export const ROTULO_DO_TIPO: Record<TipoDeLancamento, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saída',
};

/** Na ordem em que aparecem no select de cada tipo */
export const CATEGORIAS_POR_TIPO: Record<TipoDeLancamento, Categoria[]> = {
  INCOME: ['TITHE', 'OFFERING', 'DONATION', 'EVENT_INCOME', 'OTHER_INCOME'],
  EXPENSE: [
    'UTILITIES',
    'RENT',
    'MAINTENANCE',
    'SALARIES',
    'SUPPLIES',
    'MISSIONS',
    'EVENT_EXPENSE',
    'BANK_FEES',
    'OTHER_EXPENSE',
  ],
};

export const ROTULO_DA_CATEGORIA: Record<Categoria, string> = {
  TITHE: 'Dízimo',
  OFFERING: 'Oferta',
  DONATION: 'Doação',
  EVENT_INCOME: 'Evento',
  OTHER_INCOME: 'Outra entrada',
  UTILITIES: 'Água, luz e internet',
  RENT: 'Aluguel',
  MAINTENANCE: 'Manutenção',
  SALARIES: 'Salários e ajudas de custo',
  SUPPLIES: 'Materiais',
  MISSIONS: 'Missões e ação social',
  EVENT_EXPENSE: 'Evento',
  BANK_FEES: 'Tarifas bancárias',
  OTHER_EXPENSE: 'Outra saída',
};

export const ROTULO_DA_FORMA: Record<FormaDePagamento, string> = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
  TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
  OTHER: 'Outra',
};

export const ROTULO_DA_ORIGEM: Record<OrigemDoLancamento, string> = {
  MANUAL: 'Manual',
  PLUGGY: 'Banco (Pluggy)',
};

export const MESES_CURTOS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

/**
 * As cores das barras de entrada e saída da tesouraria. Não são as do tema
 * (`chips`): o par verde/vermelho de lá fica a ΔE 8 sob deuteranopia no claro,
 * e o verde passa do limite de luminosidade no escuro. Este par passou no
 * validador de paleta nos dois modos (ΔE 11,9); o contraste com o fundo fica
 * abaixo de 3:1, e por isso o valor de cada barra está sempre escrito ao lado.
 */
export const COR_ENTRADA = '#3cb043';
export const COR_SAIDA = '#c81e28';

/**
 * As abas da tesouraria administrativa. Cada uma tem endereço próprio, e não
 * só estado da tela: dá para favoritar e mandar o link de "Dízimos" direto.
 */
export const ABAS_DA_ADMINISTRATIVA = [
  {
    valor: 'conciliacao',
    rotulo: 'Conciliação',
    link: '/admin/tesouraria/administrativa/conciliacao',
  },
  {
    valor: 'dizimos',
    rotulo: 'Dízimos',
    link: '/admin/tesouraria/administrativa/dizimos',
  },
  {
    valor: 'lancamentos',
    rotulo: 'Lançamentos',
    link: '/admin/tesouraria/administrativa/lancamentos',
  },
];

export const GET_DIZIMISTAS = 'GET_DIZIMISTAS';
export const GET_LANCAMENTOS = 'GET_LANCAMENTOS';
export const GET_CONCILIACAO = 'GET_CONCILIACAO';
