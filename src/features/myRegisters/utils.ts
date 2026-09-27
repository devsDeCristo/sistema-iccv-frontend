import { paymentsWithRoles } from './types';

/**
 * Status que não esperam mais nada de quem se inscreveu: pago, em análise (já
 * pagou, falta a confirmação), cancelado e estornado. É a mesma régua que o
 * modal de pagamentos usa para decidir o que ainda dá para levar ao checkout.
 */
const STATUS_RESOLVIDOS = ['PAID', 'IN_ANALYSIS', 'CANCELED', 'REFUNDED'];

/**
 * Quantos pagamentos do evento ainda esperam a pessoa.
 *
 * Conta inscrição confirmada e compra de produto. Lista de espera fica de fora:
 * enquanto a vaga não sai não há o que pagar.
 *
 * A conta não olha o módulo de pagamento da igreja: a dívida existe do mesmo
 * jeito onde a cobrança é feita fora do sistema, e o cartão precisa dizer isso.
 * Quem olha o módulo é quem oferece o caminho de pagar — o botão de checkout.
 */
export function pagamentosEmAberto(evento?: paymentsWithRoles | null): number {
  return [
    ...(evento?.registeredRoles ?? []).map((papel) => papel.paymentStatus),
    ...(evento?.productPurchases ?? []).map((compra) => compra.status),
  ].filter((status) => !STATUS_RESOLVIDOS.includes(status ?? '')).length;
}
