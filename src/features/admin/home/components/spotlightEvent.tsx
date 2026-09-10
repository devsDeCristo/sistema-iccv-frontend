import { ReactNode } from 'react';
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
import {
  ArrowForward,
  EventBusy,
  HourglassEmptyOutlined,
  HowToRegOutlined,
  PendingActionsOutlined,
  ScheduleOutlined,
  TrendingDown,
  TrendingFlat,
  TrendingUp,
} from '@mui/icons-material';
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
import { GrupoOcupacao } from './occupancy';

interface SpotlightEventProps {
  /** Ausente enquanto a resposta não chega; `null` é igreja sem evento algum */
  event?: DashboardEvent | null;
  /** Mostra de qual igreja é o evento — só faz sentido para quem vê várias */
  showChurch?: boolean;
}

/**
 * Uma das três leituras do topo do cartão.
 *
 * A barra é opcional: ocupação e caixa têm um teto conhecido e cabem numa
 * proporção; ritmo não tem — inventar um fim para ele seria dizer que existe
 * uma meta de inscrições por semana que ninguém definiu.
 */
function Medidor({
  titulo,
  destaque,
  legenda,
  barra,
  rodape,
}: {
  titulo: string;
  destaque: string;
  legenda: string;
  barra?: { valor: number; cor: string };
  rodape?: ReactNode;
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
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
          mt: 0.5,
          fontSize: { xs: 22, sm: 25 },
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {destaque}
      </Typography>

      {barra ? (
        <Box
          sx={{
            mt: 1,
            height: 8,
            borderRadius: 4,
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
      ) : (
        rodape
      )}

      <Typography sx={{ mt: 0.75, fontSize: 12.5, color: 'text.secondary' }}>
        {legenda}
      </Typography>
    </Box>
  );
}

/** Um número pequeno do rodapé do cartão. */
function Marcador({
  icone,
  valor,
  label,
  cor,
}: {
  icone: ReactNode;
  valor: string;
  label: string;
  cor?: string;
}) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box sx={{ display: 'flex', color: cor ?? 'text.secondary' }}>
        {icone}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {valor}
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}

/**
 * O evento em foco — o coração da home.
 *
 * A tela abre respondendo "como vai o evento que está na minha mão": quantas
 * vagas restam e em qual grupo, quanto do dinheiro já entrou, se ainda entra
 * gente, quem está na espera e, durante o evento, quantos já chegaram.
 *
 * Todo número aqui está dentro do evento a que pertence, e é por isso que ele
 * decide alguma coisa — o mesmo número solto no topo da página não decidia.
 */
export function SpotlightEvent({ event, showChurch }: SpotlightEventProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (event === undefined) {
    return <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />;
  }

  if (event === null) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3 }}>
        <Stack alignItems="center" gap={1} sx={{ py: 6, px: 2 }}>
          <EventBusy sx={{ fontSize: 38, color: 'text.disabled' }} />
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
      </Card>
    );
  }

  const { cor, rotulo } = aparenciaDaFase(event.phase, theme);
  const acontecendo = event.phase === 'ongoing';
  const encerrado = event.phase === 'finished';

  const livres = vagasLivres(event);
  const lotado = livres === 0;
  const temTeto = event.seats.total !== null;
  const corDaOcupacao = lotado
    ? theme.palette.chips.alert
    : theme.palette.chips.success;

  const recebido = event.finance.paid.amount;
  const caixa = percentual(recebido, event.finance.expected);

  const { last7, previous7 } = event.pace;
  const variacao = last7 - previous7;
  const Tendencia =
    variacao > 0 ? TrendingUp : variacao < 0 ? TrendingDown : TrendingFlat;
  const corDaTendencia =
    variacao > 0
      ? theme.palette.chips.success
      : variacao < 0
        ? theme.palette.chips.canceled
        : theme.palette.text.disabled;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        // aro na cor da fase, feito com sombra para empilhar com a do tema em
        // vez de virar borda
        boxShadow: `0 0 0 1px ${alpha(cor, 0.3)}, ${theme.shadows[1]}`,
      }}
    >
      {/*
        Faixa da fase: dá a leitura do estado antes de ler o nome. Em degradê,
        e não em cor cheia de ponta a ponta — a barra sólida na largura toda
        pesa mais que o próprio título do evento.
      */}
      <Box
        sx={{
          height: 4,
          backgroundImage: `linear-gradient(90deg, ${cor}, ${alpha(cor, 0.12)})`,
        }}
      />

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: cor,
                  boxShadow: `0 0 0 4px ${alpha(cor, 0.22)}`,
                  // o pulso é reservado para o que está vivo agora
                  ...(acontecendo && {
                    '@keyframes pulsarFase': {
                      '0%': { boxShadow: `0 0 0 0 ${alpha(cor, 0.5)}` },
                      '70%': { boxShadow: `0 0 0 9px ${alpha(cor, 0)}` },
                      '100%': { boxShadow: `0 0 0 0 ${alpha(cor, 0)}` },
                    },
                    animation: 'pulsarFase 2s ease-out infinite',
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }),
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: cor,
                }}
              >
                {rotulo}
                {event.status === 'TEST' && ' · em teste'}
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: { xs: 20, sm: 25 },
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              {event.name}
            </Typography>

            <Typography
              sx={{ mt: 0.25, fontSize: 14, color: 'text.secondary' }}
            >
              {formatarPeriodo(event.startDate, event.endDate)} ·{' '}
              {quandoAcontece(event)}
              {showChurch ? ` · ${event.church.name}` : ''}
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

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={{ xs: 2.5, sm: 4 }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' } }}
            />
          }
        >
          <Medidor
            titulo="Ocupação"
            destaque={
              temTeto
                ? `${event.seats.taken} de ${event.seats.total}`
                : `${event.seats.taken}`
            }
            barra={
              temTeto
                ? {
                    valor: percentual(event.seats.taken, event.seats.total),
                    cor: corDaOcupacao,
                  }
                : undefined
            }
            legenda={
              temTeto
                ? lotado
                  ? 'Sem vagas — evento lotado'
                  : `${livres} vaga(s) em aberto · ${event.people} pessoa(s)`
                : `${event.people} pessoa(s) · sem capacidade configurada`
            }
          />

          <Medidor
            titulo="Caixa do evento"
            destaque={formatCurrency(recebido)}
            barra={{ valor: caixa, cor: theme.palette.chips.success }}
            legenda={`${caixa}% de ${formatCurrency(
              event.finance.expected
            )} cobrados`}
          />

          {/*
            Ritmo some no evento encerrado: "0 inscrições nos últimos 7 dias"
            depois que o evento acabou não é notícia nem problema.
          */}
          {!encerrado && (
            <Medidor
              titulo="Ritmo"
              destaque={`${last7} inscriç${last7 === 1 ? 'ão' : 'ões'}`}
              rodape={
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                  sx={{ mt: 1, height: 8 }}
                >
                  <Tendencia sx={{ fontSize: 18, color: corDaTendencia }} />
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: corDaTendencia,
                    }}
                  >
                    {variacao === 0
                      ? `igual à semana anterior (${previous7})`
                      : `${variacao > 0 ? '+' : ''}${variacao} vs. ${previous7} na semana anterior`}
                  </Typography>
                </Stack>
              }
              legenda="nos últimos 7 dias"
            />
          )}
        </Stack>

        {event.groups.length > 0 && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Typography
              sx={{
                mb: 1.5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              Vagas por grupo
            </Typography>

            {/* duas colunas na tela larga: um cursilho com seis grupos vira
                uma coluna comprida demais e empurra o resto da página */}
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 1.5, sm: 2 },
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                columnGap: 4,
              }}
            >
              {event.groups.map((grupo) => (
                <GrupoOcupacao key={grupo.id} grupo={grupo} />
              ))}
            </Box>
          </>
        )}

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction="row"
          gap={{ xs: 2.5, sm: 4 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Marcador
            icone={<ScheduleOutlined sx={{ fontSize: 20 }} />}
            valor={formatCurrency(event.finance.waiting.amount)}
            label={`aguardando de ${event.finance.waiting.count} inscrição(ões)`}
            cor={theme.palette.chips.alert}
          />

          {/* em análise só aparece quando existe: zero aqui é ruído */}
          {event.finance.inAnalysis.count > 0 && (
            <Marcador
              icone={<PendingActionsOutlined sx={{ fontSize: 20 }} />}
              valor={formatCurrency(event.finance.inAnalysis.amount)}
              label={`${event.finance.inAnalysis.count} comprovante(s) em análise`}
              cor={theme.palette.chips.pending}
            />
          )}

          {event.waitlist > 0 && (
            <Marcador
              icone={<HourglassEmptyOutlined sx={{ fontSize: 20 }} />}
              valor={String(event.waitlist)}
              label="na lista de espera"
              cor={theme.palette.chips.alert}
            />
          )}

          {event.checkin && (
            <Marcador
              icone={<HowToRegOutlined sx={{ fontSize: 20 }} />}
              valor={`${event.checkin.done} de ${event.checkin.total}`}
              label="com check-in concluído"
              cor={theme.palette.chips.info}
            />
          )}
        </Stack>
      </Box>
    </Card>
  );
}
