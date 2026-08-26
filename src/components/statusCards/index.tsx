import { ReactNode } from 'react';
import {
  alpha,
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

export interface StatusCard {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  /** Cor de destaque do card — sempre um token do tema */
  color: string;
  /** Pinta o ponto de status como sinal vivo, pulsando */
  live?: boolean;
}

interface StatusCardsProps {
  cards: StatusCard[];
  isLoading?: boolean;
}

/**
 * Régua de cards de estado, usada no topo das telas de listagem.
 *
 * Compartilhada de propósito: Eventos e Usuários mostram contagens diferentes,
 * mas o cartão é o mesmo objeto visual. Duplicar o estilo faria os dois
 * divergirem no primeiro ajuste.
 */
export function StatusCards({ cards, isLoading }: StatusCardsProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              border: `1px solid ${alpha(card.color, 0.28)}`,
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
                boxShadow: `0 6px 20px ${alpha(card.color, 0.22)}`,
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
                    sx={{
                      fontSize: { xs: '40px', sm: '44px' },
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
