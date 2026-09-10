import {
  AccountBalanceWalletOutlined,
  PendingActionsOutlined,
  PersonSearchOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { formatCurrency } from '../../../../utils';
import { DashboardEvent, DashboardTreasury } from '../types';
import { percentual } from '../utils';

interface TreasuryKpisProps {
  events: DashboardEvent[];
  treasury: DashboardTreasury;
}

/**
 * A régua do financeiro: só dinheiro.
 *
 * Vagas, ritmo e lista de espera saíram — nada disso é decisão dele. O que
 * entrou, o que falta entrar, o que espera conferência e quantas pessoas
 * devem: as quatro perguntas que ele abre o painel para responder.
 */
export function TreasuryKpis({ events, treasury }: TreasuryKpisProps) {
  const theme = useTheme();

  /**
   * Soma todos os eventos ativos, encerrados ou não: cobrança em aberto não
   * deixa de existir porque o cursilho acabou — e é justamente a de evento
   * passado que costuma ficar esquecida.
   */
  const soma = (pegar: (event: DashboardEvent) => number) =>
    events.reduce((total, event) => total + pegar(event), 0);

  const recebido = soma((event) => event.finance.paid.amount);
  const previsto = soma((event) => event.finance.expected);
  const aguardando = soma((event) => event.finance.waiting.amount);
  const emAnalise = soma((event) => event.finance.inAnalysis.amount);
  const aConferir = soma((event) => event.finance.inAnalysis.count);

  const cards: StatusCard[] = [
    {
      title: 'Recebido',
      value: formatCurrency(recebido),
      subtitle: `${percentual(recebido, previsto)}% de ${formatCurrency(
        previsto
      )} cobrados`,
      icon: <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      // dinheiro em 39px estoura a largura do card já na casa dos milhares
      compact: true,
    },
    {
      title: 'A receber',
      value: formatCurrency(aguardando),
      subtitle: 'Cobranças em aberto nos eventos',
      icon: <ScheduleOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
      compact: true,
    },
    {
      title: 'A conferir',
      value: formatCurrency(emAnalise),
      subtitle: aConferir
        ? `${aConferir} comprovante(s) esperando você`
        : 'Nenhum comprovante na fila',
      icon: <PendingActionsOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.pending,
      compact: true,
    },
    {
      /**
       * Pessoas, e não valor: o valor já está em "a receber". O que este card
       * acrescenta é o tamanho da lista que alguém vai ter que cobrar.
       */
      title: 'Devendo',
      value: treasury.debtors.people,
      subtitle: treasury.debtors.people
        ? `${treasury.debtors.charges} cobrança(s) · ${formatCurrency(
            treasury.debtors.amount
          )}`
        : 'Ninguém em aberto',
      icon: <PersonSearchOutlined sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.canceled,
    },
  ];

  return <StatusCards cards={cards} sx={{ mb: 0 }} />;
}
