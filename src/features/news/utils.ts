import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { News } from './types';

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
