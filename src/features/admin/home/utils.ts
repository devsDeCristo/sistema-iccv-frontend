import dayjs from 'dayjs';
import { Theme } from '@mui/material';
import { ROLE_LABELS, Role } from '../../../constants/roles';
import { DashboardChurch, DashboardEvent, EventPhase } from './types';

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

/**
 * Um pedaço da frase de apresentação. `forte` marca o nome da igreja, que é a
 * única palavra que a pessoa procura de relance na faixa.
 */
export type TrechoDaApresentacao = { texto: string; forte?: boolean };

/**
 * Nome da igreja encaixado numa frase, separado do que vem antes dele.
 *
 * "da igreja Betel" lê bem; "da igreja Igreja Padrão" não. Quando o nome já
 * começa com "Igreja", o substantivo sai — é o mesmo que a pessoa faria
 * falando. Volta em duas partes porque só o nome é destacado.
 */
function daIgreja(nome: string): TrechoDaApresentacao[] {
  const preposicao = /^igreja\b/i.test(nome.trim()) ? 'da ' : 'da igreja ';
  return [{ texto: preposicao }, { texto: nome, forte: true }];
}

/** Junta os vínculos com vírgula, e "e" antes do último. */
function listar(grupos: TrechoDaApresentacao[][]): TrechoDaApresentacao[] {
  return grupos.flatMap((grupo, indice) => {
    if (indice === 0) return grupo;
    const separador = indice === grupos.length - 1 ? ' e ' : ', ';
    return [{ texto: separador }, ...grupo];
  });
}

/**
 * Quem a pessoa é e o que vem abaixo, em duas frases.
 *
 * A primeira identifica: cargo e igreja ditos por extenso, e não em etiquetas
 * soltas — é a primeira coisa que a tela fala, e deve se ler como alguém
 * falando. Quem tem vínculo em duas igrejas com papéis diferentes vê os dois:
 * é justamente o caso em que "Admin" sozinho mentiria pela metade.
 *
 * A segunda anuncia o que a pessoa vai encontrar rolando a página, e muda com
 * o perfil porque o conteúdo muda: prometer "um resumo da sua igreja" para
 * quem vê gráficos de sistema seria promessa falsa.
 *
 * Sai em trechos, e não em texto corrido, para o nome da igreja poder ser
 * destacado sem a tela remontar a frase por conta própria.
 */
export function apresentacao(
  role: number | null | undefined,
  churches: DashboardChurch[] | null | undefined
): TrechoDaApresentacao[] | null {
  if (role === null || role === undefined) return null;

  const papel = (valor: number) => (ROLE_LABELS[valor] ?? '').toLowerCase();
  const meu = papel(role);
  if (!meu) return null;

  // super admin e dev não pertencem a igreja nenhuma: atravessam todas
  if (churches === null) {
    const oQueVem =
      role === Role.DEV
        ? 'os indicadores do sistema'
        : 'um resumo das igrejas e dos usuários';

    return [
      {
        texto: `Você é ${meu} e acompanha todas as igrejas do sistema. A seguir, ${oQueVem}.`,
      },
    ];
  }

  if (churches === undefined) return null;

  /**
   * Sem vínculo não há resumo a prometer: a segunda frase vira o que fazer a
   * respeito, que é o que a pessoa precisa nesse estado.
   */
  if (churches.length === 0) {
    return [
      {
        texto: `Você é ${meu}, mas ainda não está vinculado a nenhuma igreja. Peça a um super admin para incluir você em uma.`,
      },
    ];
  }

  const vinculos = churches.map((igreja) => {
    const cargo =
      igreja.role !== null && papel(igreja.role) ? papel(igreja.role) : meu;
    return [{ texto: `${cargo} ` }, ...daIgreja(igreja.name)];
  });

  const resumo =
    churches.length > 1
      ? 'um resumo das suas igrejas'
      : 'um resumo da sua igreja';

  return [
    { texto: 'Você é ' },
    ...listar(vinculos),
    { texto: `. A seguir, ${resumo}.` },
  ];
}
