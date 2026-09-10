import {
  EventAvailable,
  HourglassEmptyOutlined,
  PendingActionsOutlined,
  PeopleAltOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { formatCurrency } from '../../../../utils';
import { DashboardEvent } from '../types';

interface ChurchKpisProps {
  events: DashboardEvent[];
}

/**
 * Os quatro números da igreja.
 *
 * Todos somam **só os eventos em jogo** — os abertos, ou o último encerrado
 * quando não há nenhum. Somar a história inteira daria um número grande que
 * não decide nada: quem toca um cursilho não age sobre o que aconteceu em
 * 2024.
 */
export function ChurchKpis({ events }: ChurchKpisProps) {
  const theme = useTheme();

  /**
   * Ocupação olha só o que ainda não terminou — não se enche vaga de evento
   * encerrado. Dinheiro olha todos: cobrança em aberto não deixa de existir
   * porque o cursilho acabou.
   */
  const naAgenda = events.filter((event) => event.phase !== 'finished');
  const emJogo = naAgenda.length ? naAgenda : events;

  const soma = (
    pegar: (event: DashboardEvent) => number,
    lista: DashboardEvent[] = emJogo
  ) => lista.reduce((total, event) => total + pegar(event), 0);

  const acontecendo = events.filter(
    (event) => event.phase === 'ongoing'
  ).length;
  const aCaminho = events.filter((event) => event.phase === 'upcoming').length;
  const encerrados = events.filter(
    (event) => event.phase === 'finished'
  ).length;

  const composicao =
    [
      acontecendo && `${acontecendo} acontecendo`,
      aCaminho && `${aCaminho} a caminho`,
      encerrados && `${encerrados} encerrado(s)`,
    ]
      .filter(Boolean)
      .join(' · ') || 'Nenhum evento ativo';

  const inscritos = soma((event) => event.seats.taken);
  // evento sem capacidade definida não entra no total de vagas: somar zero
  // por ele faria um evento lotado parecer com espaço
  const vagas = emJogo.reduce(
    (total, event) => total + (event.seats.total ?? 0),
    0
  );

  const naEspera = soma((event) => event.waitlist);
  // comprovante parado conta mesmo em evento encerrado: é dinheiro esperando
  const aConferir = soma((event) => event.finance.inAnalysis.count, events);
  const emAnalise = soma((event) => event.finance.inAnalysis.amount, events);
  const livres = Math.max(vagas - inscritos, 0);

  const cards: StatusCard[] = [
    {
      /**
       * Conta o que está marcado como ativo, encerrado ou não — é o mesmo
       * conjunto da lista logo abaixo. A composição vai no rótulo, para o
       * número não dar a entender que há três cursilhos rolando.
       */
      title: 'Eventos ativos',
      value: events.length,
      subtitle: composicao,
      icon: <EventAvailable sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      live: acontecendo > 0,
    },
    {
      title: 'Inscritos',
      value: inscritos,
      subtitle: vagas
        ? `De ${vagas} vagas · ${livres} em aberto`
        : 'Sem capacidade definida',
      icon: <PeopleAltOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
    },
    {
      /*
        Dinheiro não entra na régua: ele já aparece na linha de cada evento e,
        somado e aberto em três estados, no bloco de finanças logo abaixo. Um
        terceiro "recebido" na mesma tela só repetiria o número.
      */
      title: 'Lista de espera',
      value: naEspera,
      subtitle: naEspera
        ? livres
          ? `${livres} vaga(s) para chamar`
          : 'Sem vaga para chamar'
        : 'Ninguém aguardando vaga',
      icon: <HourglassEmptyOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
    },
    {
      title: 'A conferir',
      value: aConferir,
      subtitle: aConferir
        ? `${formatCurrency(emAnalise)} esperando aprovação`
        : 'Nenhum comprovante na fila',
      icon: <PendingActionsOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.pending,
    },
  ];

  return <StatusCards cards={cards} sx={{ mb: 0 }} />;
}
