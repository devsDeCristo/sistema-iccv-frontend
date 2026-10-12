import { formatCurrency } from '../../../utils';

/** "R$ 249,90/mês", ou "Grátis" no plano de valor zero */
export const valorDoPlano = (price: number) =>
  price ? `${formatCurrency(price)}/mês` : 'Grátis';
