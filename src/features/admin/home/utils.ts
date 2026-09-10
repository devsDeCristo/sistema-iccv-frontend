import dayjs from 'dayjs';
import { Theme } from '@mui/material';
import { DashboardEvent, EventPhase } from './types';

/**
 * Como o evento se apresenta na tela conforme a fase.
 *
 * A cor não é decoração: ela é o que separa, de relance, o evento que está
 * acontecendo agora do que ainda vai abrir e do que já passou. Fica junto do
 * rótulo para os dois nunca discordarem.
 */
export function aparenciaDaFase(phase: EventPhase, theme: Theme) {
  if (phase === 'ongoing') {
    return { cor: theme.palette.chips.info, rotulo: 'Acontecendo agora' };
  }
  if (phase === 'upcoming') {
    return { cor: theme.palette.chips.success, rotulo: 'Aberto' };
  }
  return { cor: theme.palette.text.disabled, rotulo: 'Encerrado' };
}

/**
 * O quanto falta ou quanto já passou, em linguagem de quem opera.
 *
 * `contagemRegressiva` da área do inscrito só olha para a frente — devolve nulo
 * para evento que acabou. No painel o evento encerrado continua importando: no
 * dia seguinte é ele que o admin abre para fechar as contas.
 */
export function quandoAcontece(event: DashboardEvent): string {
  const inicio = dayjs(event.startDate).startOf('day');
  const fim = dayjs(event.endDate).startOf('day');
  const hoje = dayjs().startOf('day');

  if (event.phase === 'ongoing') {
    const restam = fim.diff(hoje, 'day');
    if (restam === 0) return 'Último dia';
    return restam === 1 ? 'Termina amanhã' : `Faltam ${restam} dias para o fim`;
  }

  if (event.phase === 'upcoming') {
    const dias = inicio.diff(hoje, 'day');
    if (dias === 0) return 'Começa hoje';
    if (dias === 1) return 'Começa amanhã';
    return `Faltam ${dias} dias`;
  }

  const dias = hoje.diff(fim, 'day');
  if (dias === 0) return 'Encerrado hoje';
  return dias === 1 ? 'Encerrado ontem' : `Encerrado há ${dias} dias`;
}

/**
 * Percentual inteiro e preso a 100 — barra passando do fim não diz nada.
 *
 * Aceita o todo nulo (evento ou grupo sem capacidade configurada) e devolve
 * zero: quem chama já decide, por outro caminho, se desenha a barra.
 */
export function percentual(parte: number, todo: number | null): number {
  if (!todo || todo <= 0) return 0;
  return Math.min(100, Math.round((parte / todo) * 100));
}

/** Vagas livres, ou `null` quando o evento não tem capacidade configurada. */
export function vagasLivres(event: DashboardEvent): number | null {
  if (event.seats.total === null) return null;
  return Math.max(0, event.seats.total - event.seats.taken);
}
