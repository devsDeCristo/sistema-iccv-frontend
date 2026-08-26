import { ReactNode } from 'react';
import {
  alpha,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { sombraSuperficie } from '../../themes';

export interface StatusCard {
  title: string;
  /** Número ou valor já formatado (dinheiro, por exemplo) */
  value: ReactNode;
  subtitle: string;
  icon: ReactNode;
  /** Cor de destaque do card — sempre um token do tema */
  color: string;
  /** Pinta o ponto de status como sinal vivo, pulsando */
  live?: boolean;
  /** Valor menor, para texto longo como dinheiro não estourar a largura */
  compact?: boolean;
}

interface StatusCardsProps {
  cards: StatusCard[];
  isLoading?: boolean;
  /**
   * Espaçamento da régua. O padrão deixa um vão embaixo, que é o que as telas
   * de listagem querem; quem tem outro elemento colado embaixo passa `mb: 0`.
   */
  sx?: SxProps<Theme>;
}

/**
 * Régua de cards de estado, usada no topo das telas de listagem.
 *
 * Compartilhada de propósito: Eventos e Usuários mostram contagens diferentes,
 * mas o cartão é o mesmo objeto visual. Duplicar o estilo faria os dois
 * divergirem no primeiro ajuste.
 */
export function StatusCards({ cards, isLoading, sx }: StatusCardsProps) {
  const theme = useTheme();

  // a régua divide a linha pelo número de cards: 4 em quatro colunas, 3 em três
  const colunas =
    cards.length === 1 ? 12 : cards.length === 2 ? 6 : cards.length === 3 ? 4 : 3;

  return (
    <Grid
      container
      spacing={2}
      sx={[{ mb: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={colunas} key={card.title}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              // 12px: o raio padrão do Paper no tema é 8px e deixava o card
              // duro perto do número em 44px
              borderRadius: 3,
              /**
               * Aro na cor do card em vez de `border`: mesma leitura, mas feito
               * com box-shadow, então empilha com a sombra da superfície e não
               * volta a ser borda.
               */
              boxShadow: `0 0 0 1px ${alpha(card.color, 0.28)}, ${sombraSuperficie(
                theme.palette.mode === 'dark'
              )}`,
              /**
               * A tinta da cor entra como gradiente sobre o paper do tema, em
               * vez de cor cheia: o card ganha identidade sem virar um bloco
               * chapado, e continua sendo o `paper` do sistema por baixo.
               */
              backgroundImage: `linear-gradient(160deg, ${alpha(
                card.color,
                0.13
              )}, transparent 72%)`,
              transition: theme.transitions.create(
                ['transform', 'box-shadow'],
                { duration: theme.transitions.duration.shorter }
              ),
              '&:hover': {
                transform: 'translateY(-3px)',
                // o aro se mantém no hover; só a sombra cresce na cor do card
                boxShadow: `0 0 0 1px ${alpha(
                  card.color,
                  0.4
                )}, 0 10px 26px -6px ${alpha(card.color, 0.3)}`,
              },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: card.color,
                    boxShadow: `0 0 0 4px ${alpha(card.color, 0.22)}`,
                    // o pulso é reservado para o que muda sozinho na tela
                    ...(card.live && {
                      '@keyframes pulsarStatus': {
                        '0%': { boxShadow: `0 0 0 0 ${alpha(card.color, 0.5)}` },
                        '70%': {
                          boxShadow: `0 0 0 9px ${alpha(card.color, 0)}`,
                        },
                        '100%': {
                          boxShadow: `0 0 0 0 ${alpha(card.color, 0)}`,
                        },
                      },
                      animation: 'pulsarStatus 2s ease-out infinite',
                      // quem pediu menos movimento no sistema não leva pulso
                      '@media (prefers-reduced-motion: reduce)': {
                        animation: 'none',
                      },
                    }),
                  }}
                />
                <Typography
                  noWrap
                  sx={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                  }}
                  color="text.secondary"
                >
                  {card.title}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                mt={1}
              >
                {isLoading ? (
                  <Skeleton variant="rounded" width={64} height={44} />
                ) : (
                  <Typography
                    noWrap
                    sx={{
                      fontSize: card.compact
                        ? { xs: '26px', sm: '30px' }
                        : { xs: '40px', sm: '44px' },
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      // sem isto o número dança de largura entre 1 e 4 dígitos
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {card.value}
                  </Typography>
                )}

                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    bgcolor: card.color,
                    color: theme.palette.common.white,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>

              <Typography
                noWrap
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
