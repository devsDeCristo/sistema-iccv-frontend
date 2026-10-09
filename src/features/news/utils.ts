import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { News, NewsSchedule } from './types';

/**
 * Data que a notícia mostra: a da publicação, caindo para a de criação enquanto
 * ela é rascunho (o admin também vê a lista).
 *
 * Hoje e ontem viram palavra em vez de data — no feed é o que diz "isto é
 * novo" sem a pessoa ter que comparar com o calendário.
 */
export function dataDaNoticia(
  news: Pick<News, 'publishedAt' | 'createdAt'>,
  agora: Date = new Date()
): string {
  const data = dayjs(news.publishedAt || news.createdAt).locale('pt-br');
  if (!data.isValid()) return '';

  const hoje = dayjs(agora).startOf('day');
  const dia = data.startOf('day');

  if (dia.isSame(hoje)) return `Hoje, ${data.format('HH:mm')}`;
  if (dia.isSame(hoje.subtract(1, 'day'))) return 'Ontem';
  if (dia.isSame(hoje, 'year')) return data.format('D [de] MMMM');

  return data.format('D [de] MMMM [de] YYYY');
}

/**
 * O que falta em cada agendamento para poder salvar, ou `null` se está pronto.
 * Conferido antes de salvar a notícia: falhar depois deixaria a notícia gravada
 * e os agendamentos não.
 */
export function problemaDoAgendamento(agendamento: NewsSchedule) {
  if (agendamento.kind === 'ONCE') {
    if (!agendamento.runAt) return 'Informe a data e a hora.';
    if (dayjs(agendamento.runAt).isBefore(dayjs())) {
      return 'A data precisa ser futura.';
    }
    return null;
  }

  if (!agendamento.weekdays?.length) return 'Escolha ao menos um dia.';
  if (!agendamento.time) return 'Informe o horário.';
  return null;
}
