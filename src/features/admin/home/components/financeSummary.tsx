import {
  alpha,
  Box,
  Card,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { formatCurrency } from '../../../../utils';
import { DashboardEvent } from '../types';
import { percentual } from '../utils';
import { SecaoDaHome } from './secao';

interface FinanceSummaryProps {
  events: DashboardEvent[];
}

/** Uma coluna do bloco: o estado, quanto e quantos pagamentos. */
function Estado({
  rotulo,
  descricao,
  valor,
  quantidade,
  cor,
}: {
  rotulo: string;
  descricao: string;
  valor: number;
  quantidade: number;
  cor: string;
}) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Box
          sx={{
            flexShrink: 0,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: cor,
            boxShadow: `0 0 0 4px ${alpha(cor, 0.22)}`,
          }}
        />
        <Typography
          noWrap
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {rotulo}
        </Typography>
      </Stack>

      <Typography
        noWrap
        sx={{
          mt: 0.75,
          fontSize: { xs: 20, sm: 22 },
          fontWeight: 700,
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCurrency(valor)}
      </Typography>

      <Typography sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary' }}>
        {quantidade} {descricao}
      </Typography>
    </Box>
  );
}

/**
 * O caixa da igreja, somando os eventos em jogo.
 *
 * A barra compara o que entrou com o que foi cobrado — é a leitura que os três
 * números sozinhos não dão, e é a pergunta que o admin faz ao abrir o painel.
 * Recusado, cancelado e estornado ficam de fora: nenhum é dinheiro a caminho.
 */
export function FinanceSummary({ events }: FinanceSummaryProps) {
  const theme = useTheme();

  const abertos = events.filter((event) => event.phase !== 'finished');
  const emJogo = abertos.length ? abertos : events;

  const soma = (pegar: (event: DashboardEvent) => number) =>
    emJogo.reduce((total, event) => total + pegar(event), 0);

  const recebido = soma((event) => event.finance.paid.amount);
  const emAnalise = soma((event) => event.finance.inAnalysis.amount);
  const aguardando = soma((event) => event.finance.waiting.amount);
  const previsto = recebido + emAnalise + aguardando;
  const pct = percentual(recebido, previsto);

  return (
    <SecaoDaHome
      titulo={
        abertos.length > 1
          ? `Finanças · ${abertos.length} eventos abertos`
          : 'Finanças'
      }
    >
      <Card elevation={0} sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 2, sm: 3 }}
          divider={
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' },
                width: '1px',
                alignSelf: 'stretch',
                bgcolor: theme.palette.divider,
              }}
            />
          }
        >
          <Estado
            rotulo="Recebido"
            descricao="confirmado(s)"
            valor={recebido}
            quantidade={soma((event) => event.finance.paid.count)}
            cor={theme.palette.chips.success}
          />
          <Estado
            rotulo="Em análise"
            descricao="comprovante(s) na fila"
            valor={emAnalise}
            quantidade={soma((event) => event.finance.inAnalysis.count)}
            cor={theme.palette.chips.pending}
          />
          <Estado
            rotulo="Aguardando"
            descricao="em aberto"
            valor={aguardando}
            quantidade={soma((event) => event.finance.waiting.count)}
            cor={theme.palette.chips.alert}
          />
        </Stack>

        <Box sx={{ mt: 2.5 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            color="success"
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
          >
            {pct}% de {formatCurrency(previsto)} previstos já recebidos
          </Typography>
        </Box>
      </Card>
    </SecaoDaHome>
  );
}
