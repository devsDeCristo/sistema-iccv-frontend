import {
  EventSeatOutlined,
  GroupsOutlined,
  PendingActionsOutlined,
  PieChartOutline,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { User } from '../../../../types/user';
import { EventDetails } from '../types';

/**
 * Como está a lotação do evento, acima da lista de inscritos.
 *
 * A lotação sai do próprio evento, que já vem com a contagem por regra
 * (`registered`), e as liberações pendentes saem da mesma lista da tabela —
 * a tela não pede nada a mais para montar os cards.
 *
 * Conta inscrições, e não pessoas: é o que ocupa vaga, e é o número que
 * conversa com a capacidade dos grupos. A exceção é a liberação, que é da
 * pessoa: quem é menor de idade precisa de uma autorização só, esteja em
 * quantos grupos estiver.
 */
export function CardsRegistrations({
  event,
  users,
  isLoading,
}: {
  event?: EventDetails;
  users?: User[];
  isLoading?: boolean;
}) {
  const theme = useTheme();

  const grupos = event?.groupRoles ?? [];
  const regras = grupos.flatMap((grupo) => grupo.roles ?? []);

  const inscritos = regras.reduce(
    (total, regra) => total + (regra.registered ?? 0),
    0
  );
  // menores de idade cuja autorização do responsável ainda não foi analisada:
  // estão inscritos e ocupando vaga, mas não podem participar assim
  const aguardandoLiberacao = (users ?? []).filter(
    (usuario) => usuario.minorApprovalStatus === 'PENDING'
  ).length;
  // grupo sem capacidade é grupo sem teto: some da conta de vagas em vez de
  // entrar como zero, que faria o evento parecer lotado
  const comTeto = grupos.filter((grupo) => !!grupo.capacity);
  const vagas = comTeto.reduce((total, grupo) => total + grupo.capacity, 0);
  const restantes = Math.max(0, vagas - inscritos);
  const ocupacao = vagas > 0 ? Math.round((inscritos / vagas) * 100) : null;

  const cards: StatusCard[] = [
    {
      title: 'Inscritos',
      value: inscritos,
      subtitle:
        grupos.length === 1
          ? 'Inscrições confirmadas'
          : `Em ${grupos.length} grupos`,
      icon: <GroupsOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Vagas restantes',
      value: vagas > 0 ? restantes : '—',
      subtitle: vagas > 0 ? `De ${vagas} vagas` : 'Nenhum grupo tem teto',
      icon: <EventSeatOutlined sx={{ fontSize: 20 }} />,
      // amarelo quando está acabando: é quando o número muda alguma decisão
      color:
        vagas > 0 && restantes === 0
          ? theme.palette.chips.canceled
          : vagas > 0 && restantes <= vagas * 0.1
            ? theme.palette.chips.alert
            : theme.palette.chips.success,
    },
    {
      title: 'Ocupação',
      value: ocupacao === null ? '—' : `${ocupacao}%`,
      subtitle: ocupacao === null ? 'Sem teto definido' : 'Das vagas do evento',
      icon: <PieChartOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
    },
    {
      title: 'Liberações pendentes',
      value: aguardandoLiberacao,
      subtitle: 'Menores aguardando autorização',
      icon: <PendingActionsOutlined sx={{ fontSize: 20 }} />,
      // cinza quando não há nenhuma: zero aqui é boa notícia, e a cor de
      // alerta acesa o tempo todo deixa de significar alguma coisa
      color: aguardandoLiberacao
        ? theme.palette.chips.pending
        : theme.palette.text.disabled,
    },
  ];

  // sem margem própria: quem espaça é o `gap` da aba
  return <StatusCards cards={cards} isLoading={isLoading} sx={{ mb: 0 }} />;
}
