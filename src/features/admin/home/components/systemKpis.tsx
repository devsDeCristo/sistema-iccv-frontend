import {
  ChurchOutlined,
  EventAvailable,
  GroupsOutlined,
  PersonOffOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { Role } from '../../../../constants/roles';
import { DashboardChurchRow, DashboardPanorama } from '../types';

interface SystemKpisProps {
  churches: DashboardChurchRow[];
  panorama: DashboardPanorama;
}

/**
 * Os quatro números de abertura do super admin.
 *
 * Aqui o total do sistema faz sentido, e é justamente o que não fazia na home
 * de quem administra uma igreja: "1.025 pessoas cadastradas" não ajuda quem
 * está tocando um cursilho, mas é o tamanho da coisa para quem responde pelo
 * conjunto.
 */
export function SystemKpis({ churches, panorama }: SystemKpisProps) {
  const theme = useTheme();
  const { users } = panorama;

  const comEventoAberto = churches.filter(
    (igreja) => igreja.openEvents > 0
  ).length;

  const eventosAbertos = churches.reduce(
    (soma, igreja) => soma + igreja.openEvents,
    0
  );

  /**
   * Quem alcança o painel: todo perfil que não é inscrito comum. Não dá para
   * usar o número de vínculos — super admin e dev não têm nenhum e entram
   * assim mesmo.
   */
  const noPainel = users.byRole
    .filter((linha) => linha.role !== Role.USER)
    .reduce((soma, linha) => soma + linha.total, 0);

  const cards: StatusCard[] = [
    {
      title: 'Igrejas',
      value: churches.length,
      subtitle:
        comEventoAberto === 0
          ? 'Nenhuma com evento aberto'
          : `${comEventoAberto} com evento aberto`,
      icon: <ChurchOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Eventos abertos',
      value: eventosAbertos,
      subtitle: 'Acontecendo ou a caminho',
      icon: <EventAvailable sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      live: eventosAbertos > 0,
    },
    {
      title: 'Pessoas cadastradas',
      value: users.total,
      subtitle:
        users.newThisMonth === 0
          ? 'Nenhum cadastro novo este mês'
          : `+${users.newThisMonth} este mês`,
      icon: <GroupsOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
    },
    {
      /**
       * O número que só aparece olhando o sistema inteiro: base que cresce sem
       * ninguém se inscrever não é crescimento.
       */
      title: 'Nunca se inscreveram',
      value: users.neverRegistered,
      subtitle: `De ${users.total} cadastradas · ${noPainel} operam o painel`,
      icon: <PersonOffOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
    },
  ];

  return <StatusCards cards={cards} sx={{ mb: 0 }} />;
}
