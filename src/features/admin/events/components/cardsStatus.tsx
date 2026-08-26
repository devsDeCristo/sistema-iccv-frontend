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
import {
  EventAvailable,
  EventBusy,
  Layers,
  PlayCircleOutline,
} from '@mui/icons-material';
import { useGetEvents } from '../api/getEvents';
import { Event } from '../types';
import { emAndamento } from '../utils/eventStatus';

interface CardData {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  color: string;
  /** Pinta o ponto de status como sinal vivo, pulsando */
  live?: boolean;
}

/**
 * Resumo do estado dos eventos no sistema.
 *
 * Só contagem de estado — ativo, inativo, em andamento. Média, tempo para
 * lotar e afins saíram: análise é assunto do BI, e misturar as duas coisas aqui
 * fazia a tela prometer um painel que ela não é.
 *
 * Os números vêm da mesma query da lista abaixo, então a tela não faz uma
 * chamada a mais para montar os cards.
 */
export const CardsStatus = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetEvents({});
  const events = Array.isArray(data) ? (data as Event[]) : [];

  const ativos = events.filter((event) => event.isActive).length;
  const acontecendo = events.filter(emAndamento).length;

  const cards: CardData[] = [
    {
      title: 'Total de eventos',
      value: events.length,
      subtitle: 'Cadastrados no sistema',
      icon: <Layers sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Ativos',
      value: ativos,
      subtitle: 'Visíveis para inscrição',
      icon: <EventAvailable sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
    },
    {
      title: 'Inativos',
      value: events.length - ativos,
      subtitle: 'Ocultos do público',
      icon: <EventBusy sx={{ fontSize: 20 }} />,
      // `text.disabled` e não uma cor de alerta: inativo é estado desligado,
      // não problema. E é o único cinza do tema que aguenta ícone branco em
      // cima nos dois modos.
      color: theme.palette.text.disabled,
    },
    {
      title: 'Em andamento',
      value: acontecendo,
      subtitle: 'Acontecendo hoje',
      icon: <PlayCircleOutline sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.info,
      live: acontecendo > 0,
    },
  ];

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
                    // evento rolando agora é a única informação que muda sem
                    // ninguém mexer na tela: o pulso é o que anuncia isso
                    ...(card.live && {
                      '@keyframes pulsarStatus': {
                        '0%': { boxShadow: `0 0 0 0 ${alpha(card.color, 0.5)}` },
                        '70%': { boxShadow: `0 0 0 9px ${alpha(card.color, 0)}` },
                        '100%': { boxShadow: `0 0 0 0 ${alpha(card.color, 0)}` },
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
};
