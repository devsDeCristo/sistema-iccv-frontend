/**
 * Um evento está em andamento quando hoje cai entre o início e o fim, contando
 * o dia inteiro nas duas pontas.
 *
 * Comparar o horário cravado deixaria o evento de fora na manhã do próprio dia
 * em que ele começa, e o tiraria da conta no último dia logo depois da hora de
 * encerramento — nos dois casos ele ainda está acontecendo para quem está lá.
 */
export function emAndamento(event: {
  startDate: Date | string;
  endDate: Date | string;
}) {
  const agora = new Date();
  const inicio = new Date(event.startDate);
  const fim = new Date(event.endDate);
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(23, 59, 59, 999);
  return agora >= inicio && agora <= fim;
}
