import { ReactNode } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ArrowForward,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';

import CustomChip from '../../../../../components/customChip';
import { superficieSx } from '../../../../../components/listPageStyles';
import { sombraSuperficie } from '../../../../../themes';
import { formatCurrency } from '../../../../../utils';
import { lancamentosDa, resumir } from '../dados';

export interface CardDeTesouraria {
  id: string;
  nome: string;
  /** O ícone do quadrado do topo */
  icone: ReactNode;
  /** A cor do card (aro, tinta, ícone e chip) — sempre um token do tema */
  cor: string;
  /** O chip do canto: a situação, ou quantos membros */
  etiqueta: string;
  /** As linhas embaixo do nome, cada uma com um ícone pequeno */
  detalhes: { icone: ReactNode; texto: string }[];
}

interface Props {
  tesourarias: CardDeTesouraria[];
  /** O que dizer quando não há nenhuma */
  vazio: { titulo: string; texto: string };
  onAbrir: (id: string) => void;
}

/**
 * As tesourarias criadas (de evento ou de congregação), uma por card, com
 * entradas, saídas e o resultado.
 *
 * O acabamento é o dos cards das Igrejas e dos de resumo (`StatusCards`):
 * aro e tinta suave na cor do card, ícone num quadrado da mesma cor, e o
 * card sobe um pouco no hover. Os números vêm um embaixo do outro, rótulo à
 * esquerda e valor à direita, e abrir fica no rodapé, como "Abrir painel" na
 * igreja.
 */
function ListaDeTesourarias({ tesourarias, vazio, onAbrir }: Props) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';

  if (!tesourarias.length) {
    return (
      <Paper sx={{ ...superficieSx, p: 4, textAlign: 'center' }}>
        <Typography fontWeight={600}>{vazio.titulo}</Typography>
        <Typography variant="body2" color="text.secondary">
          {vazio.texto}
        </Typography>
      </Paper>
    );
  }

  const numero = (
    icone: ReactNode,
    rotulo: string,
    valor: number,
    forte?: boolean
  ) => (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.text.primary, 0.04),
        color: 'text.secondary',
        '& svg': { fontSize: 16 },
      }}
    >
      {icone}
      <Typography sx={{ fontSize: '0.8125rem', flex: 1 }} noWrap>
        {rotulo}
      </Typography>
      <Typography
        noWrap
        sx={{
          fontSize: forte ? '0.9375rem' : '0.875rem',
          fontWeight: forte ? 800 : 600,
          fontVariantNumeric: 'tabular-nums',
          // o vermelho é só no resultado negativo; o sinal "-" vai junto
          color:
            forte && valor < 0 ? theme.palette.chips.canceled : 'text.primary',
        }}
      >
        {formatCurrency(valor)}
      </Typography>
    </Stack>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {tesourarias.map((t) => {
        const resumo = resumir(lancamentosDa(t.id));
        return (
          <Card
            key={t.id}
            elevation={0}
            sx={{
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 0 0 1px ${alpha(t.cor, 0.24)}, ${sombraSuperficie(
                escuro
              )}`,
              backgroundImage: `linear-gradient(160deg, ${alpha(
                t.cor,
                0.1
              )}, transparent 55%)`,
              transition: theme.transitions.create(
                ['transform', 'box-shadow'],
                { duration: theme.transitions.duration.shorter }
              ),
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 0 0 1px ${alpha(
                  t.cor,
                  0.4
                )}, 0 12px 28px -8px ${alpha(t.cor, 0.32)}`,
              },
            }}
          >
            <Box
              sx={{
                p: 2.25,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                gap={1}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: t.cor,
                    backgroundColor: alpha(t.cor, 0.14),
                  }}
                >
                  {t.icone}
                </Box>
                <CustomChip
                  label={t.etiqueta}
                  customColor={t.cor}
                  size="small"
                />
              </Stack>

              <Typography
                title={t.nome}
                sx={{
                  mt: 1.75,
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {t.nome}
              </Typography>

              {t.detalhes.map((d) => (
                <Stack
                  key={d.texto}
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                  sx={{
                    mt: 0.5,
                    color: 'text.secondary',
                    minWidth: 0,
                    '& svg': { fontSize: 16, flexShrink: 0 },
                  }}
                >
                  {d.icone}
                  <Typography sx={{ fontSize: '0.8125rem' }} noWrap>
                    {d.texto}
                  </Typography>
                </Stack>
              ))}

              {/* no pé (`mt: auto`): os cards da mesma linha têm a mesma
                  altura, então os números alinham com nome curto ou longo */}
              <Stack gap={0.75} sx={{ mt: 'auto', pt: 2 }}>
                {numero(<TrendingUp />, 'Entradas', resumo.entradas)}
                {numero(<TrendingDown />, 'Saídas', resumo.saidas)}
                {numero(
                  <AccountBalanceWallet />,
                  'Resultado',
                  resumo.saldo,
                  true
                )}
              </Stack>
            </Box>

            <Divider />

            <Stack direction="row" sx={{ px: 1.25, py: 0.75 }}>
              <Button
                size="small"
                endIcon={<ArrowForward fontSize="small" />}
                onClick={() => onAbrir(t.id)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Abrir tesouraria
              </Button>
            </Stack>
          </Card>
        );
      })}
    </Box>
  );
}

export { ListaDeTesourarias };
