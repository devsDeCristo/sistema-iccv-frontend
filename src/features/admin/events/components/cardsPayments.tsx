import {
  AccountBalanceWallet,
  Paid,
  PendingActions,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Button, useTheme } from '@mui/material';
import { useFiltroSalvo } from '../../../../hooks/useFiltroSalvo';
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
export function CardsPayments({
  eventId,
  escondidos,
}: {
  eventId: string;
  /** valores trocados por "R$ ••••••" — ver `useValoresEscondidos` */
  escondidos: boolean;
}) {
  const theme = useTheme();
  const { data, isLoading } = useGetPayments(
    { eventId },
    { enabled: !!eventId }
  );
  const payments = (data as PaymentResponse[]) ?? [];
  const dinheiro = (valor: number) =>
    escondidos ? 'R$ ••••••' : formatCurrency(valor);

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
      value: dinheiro(soma()),
      subtitle: 'Inscrições e produtos',
      icon: <AccountBalanceWallet sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
      compact: true,
    },
    {
      title: 'Receita realizada',
      value: dinheiro(soma((payment) => payment.status === 'PAID')),
      subtitle: 'Pagamentos confirmados',
      icon: <Paid sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      compact: true,
    },
    {
      title: 'Receita pendente',
      value: dinheiro(soma((payment) => payment.status !== 'PAID')),
      subtitle: 'Ainda não confirmados',
      icon: <PendingActions sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
      compact: true,
    },
  ];

  // sem margem própria: quem espaça é o `gap` da aba
  return <StatusCards cards={cards} isLoading={isLoading} sx={{ mb: 0 }} />;
}

/**
 * Esconder os valores dos cards, como no app do banco: a tela do financeiro
 * fica aberta em reunião e em projetor. Lembrado entre visitas, por usuário.
 */
export function useValoresEscondidos() {
  return useFiltroSalvo(
    'financeiro:esconderValores',
    false,
    (valor): valor is boolean => typeof valor === 'boolean'
  );
}

/** O botão mora na linha das abas, ao lado do check-in */
export function BotaoEsconderValores({
  escondidos,
  onAlternar,
}: {
  escondidos: boolean;
  onAlternar: () => void;
}) {
  return (
    <Button
      color="inherit"
      onClick={onAlternar}
      startIcon={escondidos ? <Visibility /> : <VisibilityOff />}
      aria-pressed={escondidos}
      sx={{
        flexShrink: 0,
        color: 'text.secondary',
        textTransform: 'none',
        fontWeight: 600,
      }}
    >
      {escondidos ? 'Mostrar valores' : 'Esconder valores'}
    </Button>
  );
}
