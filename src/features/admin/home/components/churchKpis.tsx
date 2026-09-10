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

  const abertos = events.filter((event) => event.phase !== 'finished');
  // sem nenhum aberto a régua fala do último encerrado, que é o que a lista
  // abaixo também está mostrando
  const emJogo = abertos.length ? abertos : events;

  const soma = (pegar: (event: DashboardEvent) => number) =>
    emJogo.reduce((total, event) => total + pegar(event), 0);

  const inscritos = soma((event) => event.seats.taken);
  // evento sem capacidade definida não entra no total de vagas: somar zero
  // por ele faria um evento lotado parecer com espaço
  const vagas = emJogo.reduce(
    (total, event) => total + (event.seats.total ?? 0),
    0
  );

  const naEspera = soma((event) => event.waitlist);
  const aConferir = soma((event) => event.finance.inAnalysis.count);
  const emAnalise = soma((event) => event.finance.inAnalysis.amount);
  const livres = Math.max(vagas - inscritos, 0);

  const cards: StatusCard[] = [
    {
      title: abertos.length ? 'Eventos abertos' : 'Último evento',
      value: abertos.length || 1,
      subtitle: abertos.length
        ? 'Acontecendo ou a caminho'
        : 'Nenhum evento aberto agora',
      icon: <EventAvailable sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      live: emJogo.some((event) => event.phase === 'ongoing'),
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
