import {
  alpha,
  Box,
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForward, EventBusy, HowToRegOutlined } from '@mui/icons-material';
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

/** Uma das três leituras da linha: número em cima, barra fina embaixo. */
function Medida({
  titulo,
  destaque,
  legenda,
  barra,
}: {
  titulo: string;
  destaque: string;
  legenda: string;
  barra?: { valor: number; cor: string };
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 128 }}>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {titulo}
      </Typography>

      <Typography
        noWrap
        sx={{
          mt: 0.25,
          fontSize: 17,
          fontWeight: 700,
          lineHeight: 1.2,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {destaque}
      </Typography>

      {barra && (
        <Box
          sx={{
            mt: 0.6,
            height: 6,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: alpha(barra.cor, 0.16),
          }}
        >
          <Box
            sx={{
              width: `${barra.valor}%`,
              height: '100%',
              bgcolor: barra.cor,
            }}
          />
        </Box>
      )}

      <Typography sx={{ mt: 0.4, fontSize: 11.5, color: 'text.secondary' }}>
        {legenda}
      </Typography>
    </Box>
  );
}

/** A ocupação de um grupo, em texto — vira alerta quando fecha. */
function Grupo({
  nome,
  taken,
  capacity,
}: {
  nome: string;
  taken: number;
  capacity: number | null;
}) {
  const theme = useTheme();
  const lotado = capacity !== null && taken >= capacity;

  return (
    <Typography
      component="span"
      sx={{
        fontSize: 12,
        color: lotado ? theme.palette.chips.alert : 'text.secondary',
        fontWeight: lotado ? 600 : 400,
      }}
    >
      {nome}{' '}
      <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {capacity === null ? taken : `${taken}/${capacity}`}
      </Box>
      {lotado && ' · lotado'}
    </Typography>
  );
}

/** Um evento: identificação, as três leituras e a quebra por grupo. */
function LinhaDoEvento({ event }: { event: DashboardEvent }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { cor, rotulo } = aparenciaDaFase(event.phase, theme);
  const acontecendo = event.phase === 'ongoing';
  const encerrado = event.phase === 'finished';

  const livres = vagasLivres(event);
  const lotado = livres === 0;
  const temTeto = event.seats.total !== null;
  const caixa = percentual(event.finance.paid.amount, event.finance.expected);

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1.5}
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
            <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
              {event.name}
            </Typography>
          </Stack>

          <Typography sx={{ mt: 0.25, fontSize: 13, color: 'text.secondary' }}>
            {rotulo}
            {event.status === 'TEST' && ' · em teste'} ·{' '}
            {formatarPeriodo(event.startDate, event.endDate)} ·{' '}
            {quandoAcontece(event)}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} sx={{ flexShrink: 0 }}>
          {/* o check-in só existe enquanto o evento acontece */}
          {acontecendo && (
            <Button
              variant="contained"
              size="small"
              disableElevation
              startIcon={<HowToRegOutlined />}
              onClick={() => navigate(`/admin/eventos/${event.id}/checkin`)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}
            >
              Check-in
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowForward />}
            onClick={() =>
              navigate(`/admin/eventos/${event.id}/detalhes/usuarios`)
            }
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              whiteSpace: 'nowrap',
            }}
          >
            Abrir evento
          </Button>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        gap={{ xs: 2, sm: 3.5 }}
        flexWrap="wrap"
        useFlexGap
        sx={{ mt: 2 }}
      >
        <Medida
          titulo="Vagas"
          destaque={
            temTeto
              ? `${event.seats.taken} de ${event.seats.total}`
              : `${event.seats.taken}`
          }
          barra={
            temTeto
              ? {
                  valor: percentual(event.seats.taken, event.seats.total),
                  cor: lotado
                    ? theme.palette.chips.alert
                    : theme.palette.chips.success,
                }
              : undefined
          }
          legenda={
            temTeto
              ? lotado
                ? 'lotado'
                : `${livres} em aberto · ${event.people} pessoa(s)`
              : `${event.people} pessoa(s) · sem capacidade definida`
          }
        />

        <Medida
          titulo="Recebido"
          destaque={formatCurrency(event.finance.paid.amount)}
          barra={{ valor: caixa, cor: theme.palette.chips.success }}
          legenda={`${caixa}% de ${formatCurrency(event.finance.expected)}`}
        />

        {/* ritmo some no encerrado: "0 inscrições" depois do fim não é notícia */}
        {!encerrado && (
          <Medida
            titulo="Ritmo"
            destaque={`${event.pace.last7} inscriç${
              event.pace.last7 === 1 ? 'ão' : 'ões'
            }`}
            legenda={`em 7 dias · ${event.pace.previous7} na semana anterior`}
          />
        )}

        {event.waitlist > 0 && (
          <Medida
            titulo="Lista de espera"
            destaque={String(event.waitlist)}
            legenda={
              livres && livres > 0
                ? `${livres} vaga(s) para chamar`
                : 'sem vaga para chamar'
            }
          />
        )}

        {event.checkin && (
          <Medida
            titulo="Check-in"
            destaque={`${event.checkin.done} de ${event.checkin.total}`}
            barra={{
              valor: percentual(event.checkin.done, event.checkin.total),
              cor: theme.palette.chips.info,
            }}
            legenda="concluídos"
          />
        )}
      </Stack>

      {/*
        A quebra por grupo é a leitura que o total esconde: 145/148 no evento
        não diz que a equipe fechou em 78/78 enquanto os cursilhistas ainda têm
        três lugares — e é isso que decide se dá para chamar alguém da espera.
      */}
      {event.groups.length > 0 && (
        <Stack
          direction="row"
          gap={0.75}
          flexWrap="wrap"
          useFlexGap
          divider={
            <Typography
              component="span"
              sx={{ fontSize: 12, color: 'text.disabled' }}
            >
              ·
            </Typography>
          }
          sx={{ mt: 1.5 }}
        >
          {event.groups.map((grupo) => (
            <Grupo
              key={grupo.id}
              nome={grupo.name}
              taken={grupo.taken}
              capacity={grupo.capacity}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

/**
 * Os eventos da igreja, todos do mesmo tamanho.
 *
 * Nenhum ganha cartão próprio: com um evento só, o cartão gigante ocupava meia
 * tela para dizer o que cabe em três linhas; com dois, o segundo virava nota de
 * rodapé do primeiro. Aqui as mesmas leituras ficam numa linha por evento.
 */
export function EventsList({ events }: EventsListProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (events === undefined) {
    return <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />;
  }

  return (
    <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {events.length === 0 ? (
        <Stack alignItems="center" gap={1} sx={{ py: 6, px: 2 }}>
          <EventBusy sx={{ fontSize: 36, color: 'text.disabled' }} />
          <Typography color="text.secondary" fontSize={14}>
            Nenhum evento cadastrado ainda.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/admin/eventos/cadastro')}
            sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
          >
            Criar o primeiro evento
          </Button>
        </Stack>
      ) : (
        events.map((event, indice) => (
          <Box key={event.id}>
            {indice > 0 && (
              <Divider
                sx={{ borderColor: alpha(theme.palette.divider, 0.7) }}
              />
            )}
            <LinhaDoEvento event={event} />
          </Box>
        ))
      )}
    </Card>
  );
}
