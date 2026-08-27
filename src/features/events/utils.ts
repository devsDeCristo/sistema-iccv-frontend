import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { formatNameCase } from '../../utils';
import { Event } from '../admin/events/types';

/**
 * Helpers da página de eventos abertos — a primeira tela de quem não é da
 * organização. Ficam fora dos componentes porque são regra pura: dá para testar
 * sem montar React, e a mesma conta serve para o card e para o texto do hero.
 */

/**
 * Primeiro nome, já com a caixa arrumada: o cadastro vem em CAIXA ALTA com
 * frequência, e "BOA TARDE, JOSÉ" grita com quem acabou de entrar.
 */
export function primeiroNome(nomeCompleto?: string | null): string {
  const primeiro = (nomeCompleto ?? '').trim().split(/\s+/)[0] ?? '';

  return formatNameCase(primeiro, 'capitalize');
}

const emPtBr = (data: Date | string) => dayjs(data).locale('pt-br');

/**
 * Período do evento em linguagem de convite, não de relatório.
 *
 * O locale é aplicado por instância, e não com `dayjs.locale()`, para não trocar
 * o idioma padrão do dayjs no resto do sistema.
 */
export function formatarPeriodo(
  inicio?: Date | string | null,
  fim?: Date | string | null
): string {
  if (!inicio) return 'Data a definir';

  const dataInicio = emPtBr(inicio);
  if (!dataInicio.isValid()) return 'Data a definir';

  const dataFim = fim ? emPtBr(fim) : null;

  // evento de um dia: aí a hora importa, é o horário de chegada
  if (!dataFim?.isValid() || dataInicio.isSame(dataFim, 'day')) {
    return dataInicio.format('D [de] MMMM [·] HH:mm');
  }

  if (dataInicio.isSame(dataFim, 'month')) {
    return `${dataInicio.format('D')} a ${dataFim.format('D [de] MMMM')}`;
  }

  if (dataInicio.isSame(dataFim, 'year')) {
    return `${dataInicio.format('D [de] MMM')} a ${dataFim.format('D [de] MMM')}`;
  }

  return `${dataInicio.format('D [de] MMM [de] YYYY')} a ${dataFim.format(
    'D [de] MMM [de] YYYY'
  )}`;
}

/**
 * Contagem para o começo do evento, para o card ter senso de urgência sem
 * inventar pressão: só aparece a menos de 45 dias.
 *
 * Os dois extremos contam o dia inteiro, a mesma régua de `emAndamento` no
 * admin: um evento que começou hoje de manhã ainda "está acontecendo", e um que
 * termina hoje não vira passado à meia-tarde.
 */
export function contagemRegressiva(
  inicio?: Date | string | null,
  fim?: Date | string | null,
  agora: Date = new Date()
): string | null {
  if (!inicio) return null;

  const diaInicio = dayjs(inicio).startOf('day');
  if (!diaInicio.isValid()) return null;

  const hoje = dayjs(agora).startOf('day');
  const diaFim = dayjs(fim ?? inicio).startOf('day');

  if (hoje.isAfter(diaFim.isValid() ? diaFim : diaInicio)) return null;
  if (hoje.isSame(diaInicio)) return 'Começa hoje';
  if (hoje.isAfter(diaInicio)) return 'Acontecendo agora';

  const dias = diaInicio.diff(hoje, 'day');
  if (dias === 1) return 'Começa amanhã';
  if (dias <= 45) return `Faltam ${dias} dias`;

  return null;
}

/**
 * Os últimos eventos que já acabaram: inativos e com a data final no passado.
 *
 * Entram na home depois dos abertos, esmaecidos, para a página não ficar vazia
 * no intervalo entre um evento e outro e para quem participou reencontrar o
 * evento de onde veio.
 *
 * O corte usa o fim do dia da data final, a mesma régua de `contagemRegressiva`:
 * um evento que termina hoje ainda está acontecendo, não é passado.
 */
export function eventosEncerrados(
  data: unknown,
  quantidade = 2,
  agora: Date = new Date()
): Event[] {
  if (!Array.isArray(data)) return [];

  return (data as Event[])
    .filter((event) => {
      if (event?.status !== 'INACTIVE' || !event.endDate) return false;

      const fim = dayjs(event.endDate).endOf('day');

      return fim.isValid() && fim.isBefore(agora);
    })
    // do mais recente para o mais antigo: quem acabou ontem interessa mais que
    // quem acabou ano passado
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )
    .slice(0, quantidade);
}

export type SituacaoVagas = 'aberto' | 'ultimas' | 'esgotado';

export interface Ocupacao {
  percentual: number;
  restantes: number;
  situacao: SituacaoVagas;
}

/**
 * Ocupação do evento. `restantes` nunca é negativo e o percentual nunca passa de
 * 100: com lista de espera o número de inscritos passa da capacidade, e a barra
 * ficava estourada.
 */
export function ocupacao(
  inscritos?: number | null,
  capacidade?: number | null
): Ocupacao {
  const total = capacidade ?? 0;
  const ocupadas = Math.max(0, inscritos ?? 0);

  if (total <= 0) return { percentual: 0, restantes: 0, situacao: 'esgotado' };

  const restantes = Math.max(0, total - ocupadas);
  const percentual = Math.min(100, Math.round((ocupadas / total) * 100));
  const situacao: SituacaoVagas =
    restantes === 0 ? 'esgotado' : percentual >= 85 ? 'ultimas' : 'aberto';

  return { percentual, restantes, situacao };
}

/**
 * Os eventos que a tela mostra: só os ativos, do mais próximo para o mais
 * distante — quem entra aqui quer saber o que vem primeiro.
 *
 * Recebe o dado cru da query porque `/events` responde uma lista ou um evento
 * só, dependendo do parâmetro, e o hero e a grade precisam da mesma conta.
 *
 * `podeVerTeste` deixa o evento em teste entrar na lista para admin e super
 * admin. O backend já não devolve esses eventos para os outros perfis; o
 * parâmetro existe para a tela não depender só disso — e para o filtro
 * continuar sendo uma conta pura, testável sem montar React.
 */
export function eventosAbertos(data: unknown, podeVerTeste = false): Event[] {
  if (!Array.isArray(data)) return [];

  return (data as Event[])
    .filter(
      (event) =>
        event?.status === 'ACTIVE' || (podeVerTeste && event?.status === 'TEST')
    )
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
}
