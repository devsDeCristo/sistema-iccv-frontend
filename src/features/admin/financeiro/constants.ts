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

export const GET_DIZIMISTAS = 'GET_DIZIMISTAS';
export const GET_LANCAMENTOS = 'GET_LANCAMENTOS';
export const BUSCAR_USUARIOS_DIZIMISTA = 'BUSCAR_USUARIOS_DIZIMISTA';
