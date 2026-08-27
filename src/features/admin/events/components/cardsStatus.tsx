import {
  EventAvailable,
  EventBusy,
  Layers,
  PlayCircleOutline,
  ScienceOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { useGetEvents } from '../api/getEvents';
import { Event } from '../types';
import { emAndamento } from '../utils/eventStatus';

/**
 * Resumo do estado dos eventos no sistema.
 *
 * Só contagem de estado — ativo, inativo, em andamento. Média, tempo para
 * lotar e afins saíram: análise é assunto do BI, e misturar as duas coisas aqui
 * fazia a tela prometer um painel que ela não é.
 *
 * Os números vêm da mesma query da lista abaixo, então a tela não faz uma
 * chamada a mais para montar os cards.
 */
export const CardsStatus = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetEvents({});
  const events = Array.isArray(data) ? (data as Event[]) : [];

  const ativos = events.filter((event) => event.status === 'ACTIVE').length;
  const inativos = events.filter((event) => event.status === 'INACTIVE').length;
  const emTeste = events.filter((event) => event.status === 'TEST').length;
  const acontecendo = events.filter(emAndamento).length;

  const cards: StatusCard[] = [
    {
      title: 'Total de eventos',
      value: events.length,
      subtitle: 'Cadastrados no sistema',
      icon: <Layers sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Ativos',
      value: ativos,
      subtitle: 'Visíveis para inscrição',
      icon: <EventAvailable sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
    },
    {
      title: 'Inativos',
      value: inativos,
      subtitle: 'Ocultos do público',
      icon: <EventBusy sx={{ fontSize: 20 }} />,
      // `text.disabled` e não uma cor de alerta: inativo é estado desligado,
      // não problema. E é o único cinza do tema que aguenta ícone branco em
      // cima nos dois modos.
      color: theme.palette.text.disabled,
    },
    ...(emTeste
      ? [
          {
            title: 'Em teste',
            value: emTeste,
            subtitle: 'Visíveis só para admin',
            icon: <ScienceOutlined sx={{ fontSize: 20 }} />,
            color: theme.palette.chips.alert,
          },
        ]
      : []),
    {
      title: 'Em andamento',
      value: acontecendo,
      subtitle: 'Acontecendo hoje',
      icon: <PlayCircleOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
      live: acontecendo > 0,
    },
  ];

  return <StatusCards cards={cards} isLoading={isLoading} />;
};
