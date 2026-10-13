import {
  alpha,
  Box,
  Button,
  ButtonBase,
  Card,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { ChevronRight, EventBusy, HowToRegOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../../utils';
import { formatarPeriodo } from '../../../events/utils';
import { DashboardEvent } from '../types';
import {
  aparenciaDaFase,
  percentual,
  quandoAcontece,
  vagasLivres,
} from '../utils';

interface EventsListProps {
  /** Ausente enquanto a resposta não chega */
  events?: DashboardEvent[];
}

/** Nome | vagas | recebido | ações — a mesma grade no cabeçalho e nas linhas */
const COLUNAS = {
  xs: 'minmax(0, 1fr) auto',
  md: 'minmax(0, 1fr) 150px 170px 76px',
};

/** Número em cima e uma barra fina embaixo, numa coluna estreita */
function Leitura({
  valor,
  legenda,
  pct,
  cor,
}: {
  valor: string;
  legenda: string;
  /** Sem barra quando não há o todo (evento sem capacidade, sem cobrança) */
  pct: number | null;
  cor: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="baseline" gap={0.75}>
        {/* o número não corta; a legenda cede quando falta espaço */}
        <Typography sx={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
          {valor}
        </Typography>
        <Typography
          noWrap
          sx={{ fontSize: 12, color: 'text.secondary', minWidth: 0 }}
        >
          {legenda}
        </Typography>
      </Stack>
      {pct !== null && (
        <Box
          sx={{
            mt: 0.5,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(cor, 0.16),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${pct}%`,
              height: '100%',
              bgcolor: cor,
              borderRadius: 2,
            }}
          />
        </Box>
      )}
    </Box>
  );
}

function LinhaDoEvento({ event }: { event: DashboardEvent }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { cor } = aparenciaDaFase(event.phase, theme);
  const acontecendo = event.phase === 'ongoing';
  const livres = vagasLivres(event);
  const temTeto = event.seats.total !== null;
  const caixa = percentual(event.finance.paid.amount, event.finance.expected);
  const abrir = () => navigate(`/admin/eventos/${event.id}/detalhes/usuarios`);

  const vagas = (
    <Leitura
      valor={
        temTeto
          ? `${event.seats.taken}/${event.seats.total}`
          : `${event.seats.taken}`
      }
      legenda={livres === 0 ? 'lotado' : temTeto ? 'vagas' : 'inscritos'}
      pct={temTeto ? percentual(event.seats.taken, event.seats.total) : null}
      cor={
        livres === 0 ? theme.palette.chips.alert : theme.palette.chips.success
      }
    />
  );
  const recebido = (
    <Leitura
      valor={formatCurrency(event.finance.paid.amount)}
      legenda={event.finance.expected ? `${caixa}%` : ''}
      pct={event.finance.expected ? caixa : null}
      cor={theme.palette.chips.info}
    />
  );

  return (
    <ButtonBase
      onClick={abrir}
      aria-label={`Abrir ${event.name}`}
      sx={{
        display: 'grid',
        gridTemplateColumns: COLUNAS,
        alignItems: 'center',
        columnGap: 2,
        width: '100%',
        textAlign: 'left',
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        transition: theme.transitions.create('background-color'),
        '&:hover': { bgcolor: theme.palette.background.hover },
        '&:hover .seta': { transform: 'translateX(2px)' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              flexShrink: 0,
              bgcolor: cor,
              boxShadow: `0 0 0 3px ${alpha(cor, 0.22)}`,
              // o pulso é reservado para o que está vivo agora
              ...(acontecendo && {
                '@keyframes pulsarEvento': {
                  '0%': { boxShadow: `0 0 0 0 ${alpha(cor, 0.5)}` },
                  '70%': { boxShadow: `0 0 0 8px ${alpha(cor, 0)}` },
                  '100%': { boxShadow: `0 0 0 0 ${alpha(cor, 0)}` },
                },
                animation: 'pulsarEvento 2s ease-out infinite',
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }),
            }}
          />
          <Typography noWrap sx={{ fontSize: 14.5, fontWeight: 600 }}>
            {event.name}
          </Typography>
        </Stack>
        <Typography
          noWrap
          sx={{ pl: 2, mt: 0.25, fontSize: 12.5, color: 'text.secondary' }}
        >
          {formatarPeriodo(event.startDate, event.endDate)} ·{' '}
          {quandoAcontece(event)}
          {event.status === 'TEST' && ' · em teste'}
          {event.checkin &&
            ` · check-in ${event.checkin.done}/${event.checkin.total}`}
        </Typography>
        {/* no celular as leituras descem para baixo do nome, lado a lado */}
        <Stack
          direction="row"
          gap={2}
          sx={{ display: { xs: 'flex', md: 'none' }, pl: 2, mt: 1 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>{vagas}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>{recebido}</Box>
        </Stack>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{vagas}</Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{recebido}</Box>

      <Stack direction="row" alignItems="center" justifyContent="flex-end">
        {/* o check-in só existe enquanto o evento acontece */}
        {acontecendo && (
          <Tooltip title="Check-in">
            <IconButton
              size="small"
              color="primary"
              aria-label={`Check-in de ${event.name}`}
              onClick={(evento) => {
                evento.stopPropagation();
                navigate(`/admin/eventos/${event.id}/checkin`);
              }}
              onMouseDown={(evento) => evento.stopPropagation()}
            >
              <HowToRegOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <ChevronRight
          className="seta"
          sx={{
            color: 'text.secondary',
            transition: theme.transitions.create('transform'),
          }}
        />
      </Stack>
    </ButtonBase>
  );
}

/**
 * Os eventos da igreja que importam agora: os que estão acontecendo e os que
 * vêm a seguir — o encerrado não entra (o dinheiro dele continua cobrado em
 * "Precisa de você"). Uma linha por evento, como uma tabela: com o cartão de
 * antes, três eventos já ocupavam a tela inteira.
 *
 * Os que acontecem agora vêm primeiro; depois, do mais próximo ao mais longe.
 */
export function EventsList({ events }: EventsListProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (events === undefined) {
    return <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />;
  }

  const vigentes = events
    .filter((event) => event.phase !== 'finished')
    .sort(
      (a, b) =>
        Number(b.phase === 'ongoing') - Number(a.phase === 'ongoing') ||
        a.startDate.localeCompare(b.startDate)
    );

  return (
    <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {vigentes.length === 0 ? (
        <Stack alignItems="center" gap={1} sx={{ py: 4, px: 2 }}>
          <EventBusy sx={{ fontSize: 32, color: 'text.disabled' }} />
          <Typography color="text.secondary" fontSize={14}>
            Nenhum evento acontecendo ou a caminho.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/admin/eventos/cadastro')}
            sx={{ mt: 0.5, textTransform: 'none', borderRadius: 2 }}
          >
            Criar evento
          </Button>
        </Stack>
      ) : (
        <>
          {/* cabeçalho só na tela larga, onde as colunas existem */}
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: COLUNAS,
              columnGap: 2,
              px: 2,
              py: 1,
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              '& > *': {
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              },
            }}
          >
            <Box component="span" sx={{ pl: 2 }}>
              Evento
            </Box>
            <Box component="span">Vagas</Box>
            <Box component="span">Recebido</Box>
            <span />
          </Box>
          {vigentes.map((event) => (
            <LinhaDoEvento key={event.id} event={event} />
          ))}
        </>
      )}
    </Card>
  );
}
