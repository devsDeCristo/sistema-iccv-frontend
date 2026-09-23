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
 * Evento de igreja que não cobra online nunca tem pendência aqui — a cobrança
 * acontece fora do sistema, e o cartão nem mostra a linha de pagamento.
 */
export function pagamentosEmAberto(evento?: paymentsWithRoles | null): number {
  if (!evento?.modulePayment) return 0;

  return [
    ...(evento.registeredRoles ?? []).map((papel) => papel.paymentStatus),
    ...(evento.productPurchases ?? []).map((compra) => compra.status),
  ].filter((status) => !STATUS_RESOLVIDOS.includes(status ?? '')).length;
}

/**
 * Separa os eventos entre os que têm pagamento em aberto e os que não têm,
 * preservando a ordem em que vieram do servidor.
 */
export function separarPorPagamento(eventos?: paymentsWithRoles[] | null) {
  const lista = Array.isArray(eventos) ? eventos : [];

  return {
    pendentes: lista.filter((evento) => pagamentosEmAberto(evento) > 0),
    emDia: lista.filter((evento) => pagamentosEmAberto(evento) === 0),
  };
}
