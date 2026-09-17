import {
  AccountBalanceWallet,
  Paid,
  PendingActions,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { StatusCard, StatusCards } from '../../../../components/statusCards';
import { formatCurrency } from '../../../../utils';
import { PaymentResponse } from '../../../../types/user';
import { useGetPayments } from '../api/getPayments';

/**
 * Régua de dinheiro da aba de pagamentos.
 *
 * Fica acima da busca, e por isso mora aqui e não dentro da tabela: filtrar a
 * lista não muda o total do evento, e um resumo que dança conforme a busca
 * seria lido como se tivesse mudado.
 *
 * Os números vêm da mesma query da tabela — mesma chave no react-query, então
 * a tela não faz uma chamada a mais para montar os cards.
 */
export function CardsPayments({ eventId }: { eventId: string }) {
  const theme = useTheme();
  const { data, isLoading } = useGetPayments(
    { eventId },
    { enabled: !!eventId }
  );
  const payments = (data as PaymentResponse[]) ?? [];

  const soma = (filtro?: (payment: PaymentResponse) => boolean) =>
    payments
      .filter((payment) => (filtro ? filtro(payment) : true))
      .reduce((acc, payment) => acc + payment.amount, 0);

  /**
   * `compact` porque valor em reais é texto longo e, no tamanho dos
   * contadores, estouraria a largura do card.
   */
  const cards: StatusCard[] = [
    {
      title: 'Montante total',
      value: formatCurrency(soma()),
      subtitle: 'Inscrições e produtos',
      icon: <AccountBalanceWallet sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
      compact: true,
    },
    {
      title: 'Receita realizada',
      value: formatCurrency(soma((payment) => payment.status === 'PAID')),
      subtitle: 'Pagamentos confirmados',
      icon: <Paid sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      compact: true,
    },
    {
      title: 'Receita pendente',
      value: formatCurrency(soma((payment) => payment.status !== 'PAID')),
      subtitle: 'Ainda não confirmados',
      icon: <PendingActions sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
      compact: true,
    },
  ];

  // sem margem própria: quem espaça é o `gap` da aba
  return <StatusCards cards={cards} isLoading={isLoading} sx={{ mb: 0 }} />;
}
