import {
  alpha,
  Box,
  Card,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../../utils';
import { DashboardEvent } from '../types';
import { percentual } from '../utils';
import { SecaoDaHome } from './secao';

interface EventEarningsProps {
  events: DashboardEvent[];
}

/** Legenda: o quadrado da cor e o nome do estado. */
function Chave({ cor, nome }: { cor: string; nome: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '2px',
          bgcolor: cor,
          flexShrink: 0,
        }}
      />
      {/* o texto usa tinta de texto; a identidade fica no quadrado */}
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {nome}
      </Typography>
    </Stack>
  );
}

/**
 * Quanto cada evento já rendeu, e quanto dele ainda está no ar.
 *
 * É a seção de eventos do financeiro — a única. Vaga, ritmo e check-in não
 * são decisão dele, e uma lista de eventos ao lado desta repetiria os mesmos
 * valores duas vezes na mesma tela.
 *
 * Barra empilhada porque a pergunta é de composição: o comprimento total é o
 * que foi cobrado, e a divisão diz em que pé está. Três barras separadas
 * responderiam três perguntas soltas e esconderiam justamente o total.
 */
export function EventEarnings({ events }: EventEarningsProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const comCobranca = events.filter((event) => event.finance.expected > 0);
  if (!comCobranca.length) return null;

  const maximo = Math.max(...comCobranca.map((e) => e.finance.expected));

  const cores = {
    recebido: theme.palette.chips.success,
    analise: theme.palette.chips.pending,
    aguardando: theme.palette.chips.alert,
  };

  return (
    <SecaoDaHome titulo="Ganhos por evento">
      <Card elevation={0} sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction="row"
          gap={2}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2.5 }}
        >
          <Chave cor={cores.recebido} nome="Recebido" />
          <Chave cor={cores.analise} nome="Em análise" />
          <Chave cor={cores.aguardando} nome="A receber" />
        </Stack>

        <Stack gap={2.5}>
          {comCobranca.map((event) => {
            const { paid, inAnalysis, waiting, expected } = event.finance;
            // a barra mais longa é a do maior evento: assim eles se comparam
            // entre si, e não cada um contra si mesmo
            const escala = (valor: number) => (valor / maximo) * 100;

            return (
              <Box
                key={event.id}
                component="button"
                type="button"
                onClick={() =>
                  navigate(`/admin/eventos/${event.id}/detalhes/pagamentos`)
                }
                sx={{
                  display: 'block',
                  width: '100%',
                  border: 0,
                  p: 0,
                  bgcolor: 'transparent',
                  color: 'inherit',
                  font: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                  '&:hover .nome-do-evento': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="baseline"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.5}
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      noWrap
                      className="nome-do-evento"
                      sx={{ fontSize: 13.5, fontWeight: 600, minWidth: 0 }}
                    >
                      {event.name}
                    </Typography>
                    <ArrowForward
                      sx={{
                        fontSize: 15,
                        color: 'text.disabled',
                        flexShrink: 0,
                      }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatCurrency(paid.amount)}
                    <Box
                      component="span"
                      sx={{ fontWeight: 400, color: 'text.secondary' }}
                    >
                      {' '}
                      de {formatCurrency(expected)}
                    </Box>
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  // 2px de papel separando os pedaços da pilha
                  gap="2px"
                  sx={{
                    mt: 0.75,
                    height: 10,
                    borderRadius: '2px',
                    overflow: 'hidden',
                    bgcolor: alpha(theme.palette.divider, 0.5),
                  }}
                >
                  {(
                    [
                      ['recebido', paid.amount, cores.recebido, 'Recebido'],
                      [
                        'analise',
                        inAnalysis.amount,
                        cores.analise,
                        'Em análise',
                      ],
                      [
                        'aguardando',
                        waiting.amount,
                        cores.aguardando,
                        'A receber',
                      ],
                    ] as const
                  ).map(
                    ([chave, valor, cor, rotulo]) =>
                      valor > 0 && (
                        <Tooltip
                          key={chave}
                          title={`${rotulo}: ${formatCurrency(valor)}`}
                        >
                          <Box
                            sx={{ width: `${escala(valor)}%`, bgcolor: cor }}
                          />
                        </Tooltip>
                      )
                  )}
                </Stack>

                <Typography
                  sx={{ mt: 0.5, fontSize: 11.5, color: 'text.secondary' }}
                >
                  {percentual(paid.amount, expected)}% recebido
                  {waiting.count > 0 &&
                    ` · ${waiting.count} cobrança(s) em aberto`}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Card>
    </SecaoDaHome>
  );
}
