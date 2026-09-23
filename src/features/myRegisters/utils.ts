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

/**
 * A liberação de menor de idade ainda espera alguém.
 *
 * `PENDING` é termo faltando ou ainda sem revisão, `REJECTED` é termo devolvido
 * para reenvio: nos dois casos a inscrição está travada esperando um documento.
 * `NOT_REQUIRED` é maior de idade e `APPROVED` já passou.
 */
export function liberacaoPendente(evento?: paymentsWithRoles | null): boolean {
  const status = evento?.minorApprovalStatus;
  return status === 'PENDING' || status === 'REJECTED';
}

/**
 * O evento ainda espera alguma coisa de quem se inscreveu.
 *
 * O termo de autorização conta sempre: ele trava a inscrição igual ao dinheiro,
 * e ficava fora desta conta — um evento com termo faltando caía embaixo de "Em
 * dia", justamente o contrário do que a pessoa precisa ver.
 *
 * Dinheiro só conta onde dá para pagar por aqui. Na igreja que cobra fora do
 * sistema ninguém dá baixa pela tela, e todo evento dela moraria para sempre
 * embaixo de "Esperando você"; lá o valor em aberto continua escrito no cartão,
 * o que não entra é a separação em seções.
 */
export function temPendencia(evento?: paymentsWithRoles | null): boolean {
  const pagamentoCobravel =
    !!evento?.modulePayment && pagamentosEmAberto(evento) > 0;

  return pagamentoCobravel || liberacaoPendente(evento);
}

/**
 * Separa os eventos entre os que esperam alguma coisa da pessoa e os que não
 * esperam, preservando a ordem em que vieram do servidor.
 */
export function separarPorPendencia(eventos?: paymentsWithRoles[] | null) {
  const lista = Array.isArray(eventos) ? eventos : [];

  return {
    pendentes: lista.filter((evento) => temPendencia(evento)),
    emDia: lista.filter((evento) => !temPendencia(evento)),
  };
}
