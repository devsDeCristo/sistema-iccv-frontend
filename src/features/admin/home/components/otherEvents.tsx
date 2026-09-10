import {
  alpha,
  Box,
  Button,
  Card,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForward, EventBusy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cardTabelaSx } from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { formatarPeriodo } from '../../../events/utils';
import { DashboardEvent } from '../types';
import {
  aparenciaDaFase,
  percentual,
  quandoAcontece,
  vagasLivres,
} from '../utils';
import { SecaoDaHome } from './secao';

interface OtherEventsProps {
  events: DashboardEvent[];
  showChurch?: boolean;
  /**
   * Quem não tem cartão em foco (super admin e dev) vê esta lista como *a*
   * lista de eventos, e não como o resto dela.
   */
  titulo?: string;
  /**
   * Texto do estado vazio. Sem ele a seção some quando não há eventos — o que
   * é certo para "outros eventos", e errado para quem depende desta lista
   * como única visão de evento na página.
   */
  vazio?: string;
}

/**
 * Os demais eventos abertos, um por linha.
 *
 * Cada linha carrega a mesma leitura do cartão em foco, comprimida: ocupação
 * com barra e quanto do caixa entrou. Uma lista de nomes e datas obrigaria a
 * abrir cada evento para saber qual deles precisa de atenção.
 */
export function OtherEvents({
  events,
  showChurch,
  titulo = 'Outros eventos abertos',
  vazio,
}: OtherEventsProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!events.length && !vazio) return null;

  return (
    <SecaoDaHome
      titulo={titulo}
      acao={
        <Button
          size="small"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/admin/eventos')}
          sx={{ textTransform: 'none' }}
        >
          Ver todos
        </Button>
      }
    >
      <Card elevation={0} sx={cardTabelaSx}>
        {events.length === 0 && (
          <Stack alignItems="center" gap={1} sx={{ py: 5, px: 2 }}>
            <EventBusy sx={{ fontSize: 34, color: 'text.disabled' }} />
            <Typography color="text.secondary" fontSize={14}>
              {vazio}
            </Typography>
          </Stack>
        )}

        {events.map((event) => {
          const { cor, rotulo } = aparenciaDaFase(event.phase, theme);
          const temTeto = event.seats.total !== null;
          const ocupacao = percentual(event.seats.taken, event.seats.total);
          const livres = vagasLivres(event);
          const caixa = percentual(
            event.finance.paid.amount,
            event.finance.expected
          );

          return (
            <Stack
              key={event.id}
              component="button"
              type="button"
              onClick={() =>
                navigate(`/admin/eventos/${event.id}/detalhes/usuarios`)
              }
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              gap={{ xs: 1.5, md: 3 }}
              sx={{
                width: '100%',
                border: 0,
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
                textAlign: 'left',
                px: 2,
                py: 2,
                bgcolor: 'transparent',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                '&:last-of-type': { borderBottom: 'none' },
                '&:hover': { bgcolor: theme.palette.background.hover },
                transition: theme.transitions.create('background-color', {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1.2 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: cor,
                      flexShrink: 0,
                    }}
                  />
                  <Typography noWrap fontWeight={600} sx={{ fontSize: 15 }}>
                    {event.name}
                  </Typography>
                </Stack>
                <Typography
                  sx={{ mt: 0.25, fontSize: 12.5, color: 'text.secondary' }}
                >
                  {rotulo} · {formatarPeriodo(event.startDate, event.endDate)} ·{' '}
                  {quandoAcontece(event)}
                  {showChurch ? ` · ${event.church.name}` : ''}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Vagas
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {temTeto
                      ? `${event.seats.taken}/${event.seats.total}`
                      : `${event.seats.taken}`}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    mt: 0.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.chips.success, 0.16),
                  }}
                >
                  <Box
                    sx={{
                      width: `${ocupacao}%`,
                      height: '100%',
                      borderRadius: 3,
                      bgcolor:
                        livres === 0
                          ? theme.palette.chips.alert
                          : theme.palette.chips.success,
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Recebido
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatCurrency(event.finance.paid.amount)}
                  </Typography>
                </Stack>
                <Typography
                  sx={{ mt: 0.25, fontSize: 11.5, color: 'text.secondary' }}
                >
                  {caixa}% de {formatCurrency(event.finance.expected)}
                </Typography>
              </Box>

              <ArrowForward
                sx={{
                  display: { xs: 'none', md: 'block' },
                  flexShrink: 0,
                  fontSize: 18,
                  color: 'text.disabled',
                }}
              />
            </Stack>
          );
        })}
      </Card>
    </SecaoDaHome>
  );
}
