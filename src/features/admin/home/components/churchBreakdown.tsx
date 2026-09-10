import {
  alpha,
  Box,
  Button,
  Card,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForward, ChurchOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cardTabelaSx } from '../../../../components/listPageStyles';
import { formatDate } from '../../../../utils';
import { DashboardChurchRow } from '../types';
import { aparenciaDaFase, percentual } from '../utils';
import { SecaoDaHome } from './secao';

interface ChurchBreakdownProps {
  churches: DashboardChurchRow[];
}

/**
 * As igrejas do sistema, cada uma com o evento em foco dela.
 *
 * É o que substitui o "minha igreja" para super admin e dev. E é o evento, não
 * o histórico: "3 eventos, 812 inscritos desde 2024" não diz se a igreja está
 * parada ou com um cursilho lotando na semana que vem — que é a única coisa
 * que alguém faria algo a respeito.
 */
export function ChurchBreakdown({ churches }: ChurchBreakdownProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <SecaoDaHome
      titulo="Igrejas"
      acao={
        <Button
          size="small"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/admin/igrejas')}
          sx={{ textTransform: 'none' }}
        >
          Gerenciar
        </Button>
      }
    >
      <Card elevation={0} sx={cardTabelaSx}>
        {churches.length === 0 && (
          <Typography
            color="text.secondary"
            fontSize={14}
            sx={{ py: 4, textAlign: 'center' }}
          >
            Nenhuma igreja cadastrada.
          </Typography>
        )}

        {churches.map((igreja) => {
          const evento = igreja.spotlight;
          const fase = evento ? aparenciaDaFase(evento.phase, theme) : null;
          const temTeto = evento?.seats.total != null;
          const ocupacao = percentual(
            evento?.seats.taken ?? 0,
            evento?.seats.total ?? null
          );

          return (
            <Stack
              key={igreja.id}
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              gap={{ xs: 1.5, md: 3 }}
              sx={{
                px: 2,
                py: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                '&:last-of-type': { borderBottom: 'none' },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={1.25}
                sx={{ minWidth: 0, flex: 1 }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: '10px',
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                  }}
                >
                  <ChurchOutlined sx={{ fontSize: 18 }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap fontWeight={600} sx={{ fontSize: 15 }}>
                    {igreja.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {igreja.openEvents === 0
                      ? 'Nenhum evento aberto'
                      : `${igreja.openEvents} evento(s) aberto(s)`}{' '}
                    · {igreja.admins} no painel
                  </Typography>
                </Box>
              </Stack>

              {/*
                A igreja parada não ganha barra nem número: dizer isso em uma
                linha é mais honesto do que desenhar um medidor em zero, que se
                lê como "evento vazio" em vez de "não há evento".
              */}
              {!evento ? (
                <Typography
                  sx={{
                    flex: 1.4,
                    fontSize: 13,
                    color: 'text.disabled',
                    fontStyle: 'italic',
                  }}
                >
                  Sem evento em andamento ou a caminho
                </Typography>
              ) : (
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={2}
                  sx={{ flex: 1.4, minWidth: 0 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          flexShrink: 0,
                          bgcolor: fase?.cor,
                        }}
                      />
                      <Typography
                        noWrap
                        sx={{ fontSize: 13.5, fontWeight: 600 }}
                      >
                        {evento.name}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{ fontSize: 11.5, color: 'text.secondary' }}
                    >
                      {fase?.rotulo} · {formatDate(new Date(evento.startDate))}
                    </Typography>
                  </Box>

                  <Box sx={{ width: 118, flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {temTeto
                        ? `${evento.seats.taken}/${evento.seats.total}`
                        : `${evento.seats.taken}`}
                    </Typography>
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
                          bgcolor: theme.palette.chips.success,
                        }}
                      />
                    </Box>
                  </Box>
                </Stack>
              )}
            </Stack>
          );
        })}
      </Card>
    </SecaoDaHome>
  );
}
