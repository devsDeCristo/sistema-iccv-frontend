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
 *
 * `comAno` é para onde a data é a informação, e não um apoio: na ficha da
 * página do evento a pessoa está decidindo se vai, e "12 a 14 de setembro" de
 * qual ano é pergunta que ela não devia precisar fazer. Nas listas o ano fica
 * de fora — ali a linha é resumo, e evento de outro ano é exceção. Período que
 * atravessa a virada do ano sempre mostra os dois, com ou sem a opção.
 */
export function formatarPeriodo(
  inicio?: Date | string | null,
  fim?: Date | string | null,
  opcoes: { comAno?: boolean } = {}
): string {
  if (!inicio) return 'Data a definir';

  const dataInicio = emPtBr(inicio);
  if (!dataInicio.isValid()) return 'Data a definir';

  const dataFim = fim ? emPtBr(fim) : null;
  const ano = opcoes.comAno ? ' [de] YYYY' : '';

  // evento de um dia: aí a hora importa, é o horário de chegada
  if (!dataFim?.isValid() || dataInicio.isSame(dataFim, 'day')) {
    return dataInicio.format(`D [de] MMMM${ano} [·] HH:mm`);
  }

  if (dataInicio.isSame(dataFim, 'month')) {
    return `${dataInicio.format('D')} a ${dataFim.format(`D [de] MMMM${ano}`)}`;
  }

  if (dataInicio.isSame(dataFim, 'year')) {
    return `${dataInicio.format('D [de] MMM')} a ${dataFim.format(
      `D [de] MMM${ano}`
    )}`;
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

/** Nenhuma igreja escolhida: o catálogo inteiro. */
export const TODAS_AS_IGREJAS = 'todas';

/** Onde a escolha da pessoa fica guardada entre uma visita e outra. */
const CHAVE_DO_FILTRO = 'home:igreja';

/**
 * A igreja escolhida da última vez.
 *
 * Em `try` porque `localStorage` lança em janela anônima e com cookies
 * bloqueados: a home não pode deixar de abrir por causa de um filtro.
 */
export function lerIgrejaSalva(): string {
  try {
    return localStorage.getItem(CHAVE_DO_FILTRO) || TODAS_AS_IGREJAS;
  } catch {
    return TODAS_AS_IGREJAS;
  }
}

/** Guarda a escolha. "Todas" apaga a chave em vez de gravar o valor neutro. */
export function salvarIgreja(igrejaId: string) {
  try {
    if (igrejaId === TODAS_AS_IGREJAS) {
      localStorage.removeItem(CHAVE_DO_FILTRO);
      return;
    }
    localStorage.setItem(CHAVE_DO_FILTRO, igrejaId);
  } catch {
    // sem storage o filtro vale só nesta visita, o que é melhor que quebrar
  }
}

/**
 * As igrejas que aparecem no catálogo, sem repetir e em ordem alfabética.
 *
 * A lista sai dos próprios eventos, e não de uma consulta a igrejas: quem está
 * na área do usuário não tem permissão para listar igrejas, e as opções que
 * interessam são só aquelas que têm evento para mostrar.
 *
 * Só entra igreja ativa. Inativa e em teste continuam com os eventos delas no
 * catálogo — o que some é o atalho para procurar por elas. Situação ausente
 * conta como ativa, que é o padrão do banco: o filtro não pode sumir inteiro
 * por causa de uma resposta antiga em cache.
 */
export function igrejasDosEventos(
  data: unknown
): { id: string; nome: string }[] {
  if (!Array.isArray(data)) return [];

  const porId = new Map<string, string>();
  (data as Event[]).forEach((event) => {
    const igreja = event?.church;
    if (!igreja?.id) return;
    if ((igreja.status ?? 'ACTIVE') !== 'ACTIVE') return;

    porId.set(igreja.id, igreja.name);
  });

  return Array.from(porId, ([id, nome]) => ({ id, nome })).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  );
}

/** Recorta o catálogo na igreja escolhida. Sem escolha, devolve tudo. */
export function filtrarPorIgreja(eventos: Event[], igrejaId: string): Event[] {
  if (!igrejaId || igrejaId === TODAS_AS_IGREJAS) return eventos;

  return eventos.filter((event) => event?.church?.id === igrejaId);
}
