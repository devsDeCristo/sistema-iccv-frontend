import {
  AdminPanelSettings,
  BadgeOutlined,
  Groups,
  HowToReg,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { ADMIN_AREA_ROLES } from '../../../../constants/roles';
import { User } from '../../../../types/user';
import { useGetUsers } from '../api/getUsers';

/**
 * Resumo do estado dos usuários no sistema.
 *
 * O card antigo de "participação em eventos no ano" saiu: recorte por período é
 * análise, e análise é assunto do BI. Ficou a participação sem janela de tempo,
 * que é estado, mais a única lacuna de cadastro que realmente atrapalha — e que
 * hoje ninguém descobre até o material sair impresso errado.
 *
 * Os números vêm da mesma query da lista abaixo, então a tela não faz uma
 * chamada a mais para montar os cards.
 */
export const CardsStatus = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetUsers({});
  const users = Array.isArray(data) ? (data as User[]) : [];

  const cards: StatusCard[] = [
    {
      title: 'Total de usuários',
      value: users.length,
      subtitle: 'Cadastrados no sistema',
      icon: <Groups sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Acesso ao painel',
      value: users.filter(
        (user) => user.role !== undefined && ADMIN_AREA_ROLES.includes(user.role)
      ).length,
      subtitle: 'Perfis administrativos',
      icon: <AdminPanelSettings sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
    },
    {
      /**
       * Inscritos em algum evento ativo agora. Sem recorte de período: é
       * estado, não média.
       *
       * Não existe card de "sem foto" de propósito — a foto é tirada no posto
       * de foto do check-in, então estar sem foto antes do evento é o normal,
       * e contar isso como pendência inventaria um problema.
       */
      title: 'Em eventos ativos',
      value: users.filter((user) =>
        (user.events || []).some((item) => item.event?.status === 'ACTIVE')
      ).length,
      subtitle: 'Com inscrição em aberto',
      icon: <HowToReg sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
    },
    {
      // o PdfBadge descarta em silêncio quem não tem badgeName: o crachá
      // simplesmente não sai, e só se descobre contando as folhas impressas
      title: 'Sem nome no crachá',
      value: users.filter((user) => !user.badgeName?.trim()).length,
      subtitle: 'Não saem na impressão',
      icon: <BadgeOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
    },
  ];

  return <StatusCards cards={cards} isLoading={isLoading} />;
};
