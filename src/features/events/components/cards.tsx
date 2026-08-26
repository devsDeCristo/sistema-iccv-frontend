import {
  alpha,
  Box,
  Button,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type { Theme } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarMonthOutlined,
  EventAvailableOutlined,
  RoomOutlined,
} from '@mui/icons-material';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { useGetGroupsByUser } from '../../admin/events/api/getGroupsByUser';
import { Event } from '../../admin/events/types';
import { degradeVivo } from '../../../themes';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import {
  contagemRegressiva,
  eventosAbertos,
  formatarPeriodo,
  ocupacao,
  SituacaoVagas,
} from '../utils';

/** Como o usuário aparece neste evento, se aparecer. */
type MinhaSituacao = 'inscrito' | 'espera' | null;

const corDaSituacao = (situacao: SituacaoVagas, theme: Theme) =>
  situacao === 'esgotado'
    ? theme.palette.chips.canceled
    : situacao === 'ultimas'
      ? theme.palette.chips.alert
      : theme.palette.chips.success;

const textoDasVagas = (situacao: SituacaoVagas, restantes: number) => {
  if (situacao === 'esgotado') return 'Lista de espera';
  if (situacao === 'ultimas') {
    return restantes === 1 ? 'Última vaga' : `Últimas ${restantes} vagas`;
  }

  return restantes === 1 ? '1 vaga aberta' : `${restantes} vagas abertas`;
};

function Meta({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          color: 'text.secondary',
          '& svg': { fontSize: 15 },
        }}
      >
        {icone}
      </Box>
      <Typography
        noWrap
        sx={{ fontSize: '0.8125rem', color: 'text.secondary', minWidth: 0 }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

/** Etiqueta pequena, do tamanho do texto ao lado — nada de selo grande. */
function Etiqueta({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        px: 0.85,
        py: 0.15,
        borderRadius: 1,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: cor,
        backgroundColor: alpha(cor, 0.12),
        border: `1px solid ${alpha(cor, 0.28)}`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Um evento por linha: miniatura, nome, quando e onde, vagas e o botão.
 *
 * Linha em vez de card grande de propósito. São poucos eventos abertos ao mesmo
 * tempo, e em grade cada card virava um bloco enorme de foto — com uma linha
 * baixa a pessoa vê todos os eventos de uma vez, sem rolar, e a página fica
 * calma.
 */
function LinhaEvento({
  event,
  minhaSituacao,
  proximo,
}: {
  event: Event;
  minhaSituacao: MinhaSituacao;
  proximo?: boolean;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const escuro = theme.palette.mode === 'dark';
  const abrir = () => navigate(`/eventos/${event.id}`);

  const contagem = contagemRegressiva(event.startDate, event.endDate);
  const { percentual, restantes, situacao } = ocupacao(
    event.users,
    event.capacity
  );
  const mostrarVagas = !event.data?.hideVacancies && (event.capacity ?? 0) > 0;
  const cor = corDaSituacao(situacao, theme);

  return (
    <Paper
      onClick={abrir}
      sx={{
        p: 1.5,
        borderRadius: 3,
        cursor: 'pointer',
        // o próximo evento ganha o mesmo tingimento da faixa de boas-vindas, e
        // não um banner à parte: destaca sem quebrar o ritmo da lista. Mais
        // fraco que a faixa para não competir com ela
        backgroundImage: proximo ? degradeVivo(escuro, 100, 0.8) : undefined,
        transition: theme.transitions.create(['background-color'], {
          duration: 160,
        }),
        '&:hover': { backgroundColor: theme.palette.background.hover },
        '&:hover .titulo-evento': { color: theme.palette.primary.main },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 1.5, sm: 2 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 112 },
            height: { xs: 116, sm: 78 },
            borderRadius: 2,
            backgroundImage: `url(${event.data?.coverUrl || CapaLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ mb: 0.5, flexWrap: 'wrap' }}
          >
            {minhaSituacao && (
              <Etiqueta
                cor={
                  minhaSituacao === 'inscrito'
                    ? theme.palette.chips.success
                    : theme.palette.chips.info
                }
              >
                {minhaSituacao === 'inscrito' ? 'Inscrito' : 'Lista de espera'}
              </Etiqueta>
            )}
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {event.type}
              {contagem ? ` · ${contagem}` : ''}
            </Typography>
          </Stack>

          <Typography
            className="titulo-evento"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
              lineHeight: 1.3,
              transition: theme.transitions.create('color', { duration: 160 }),
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.name}
          </Typography>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            gap={{ xs: 0.4, lg: 2 }}
            sx={{ mt: 0.6, minWidth: 0 }}
          >
            <Meta icone={<CalendarMonthOutlined />}>
              {formatarPeriodo(event.startDate, event.endDate)}
            </Meta>
            {event.data?.localName && (
              <Meta icone={<RoomOutlined />}>{event.data.localName}</Meta>
            )}
          </Stack>
        </Box>

        <Stack
          gap={1}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 150 },
            alignItems: { xs: 'stretch', sm: 'flex-end' },
          }}
        >
          {mostrarVagas && (
            <Box sx={{ width: '100%' }}>
              <Typography
                noWrap
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: cor,
                  textAlign: { xs: 'left', sm: 'right' },
                  mb: 0.4,
                }}
              >
                {textoDasVagas(situacao, restantes)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percentual}
                sx={{
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: alpha(cor, 0.16),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    backgroundColor: cor,
                  },
                }}
              />
            </Box>
          )}

          <Button
            variant={proximo ? 'contained' : 'outlined'}
            size="small"
            fullWidth
            sx={{ borderRadius: 2, textTransform: 'none' }}
            onClick={(clique) => {
              clique.stopPropagation();
              abrir();
            }}
          >
            {minhaSituacao ? 'Ver meu evento' : 'Ver detalhes'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function EsqueletoLinha() {
  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={2}
        alignItems="center"
      >
        <Skeleton
          variant="rectangular"
          sx={{
            borderRadius: 2,
            width: { xs: '100%', sm: 112 },
            height: { xs: 116, sm: 78 },
            flexShrink: 0,
          }}
        />
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Skeleton width={90} height={14} />
          <Skeleton width="55%" height={22} />
          <Skeleton width="40%" height={16} />
        </Box>
        <Skeleton
          variant="rectangular"
          sx={{ borderRadius: 2, width: { xs: '100%', sm: 150 }, height: 31 }}
        />
      </Stack>
    </Paper>
  );
}

/**
 * Título de seção da lista. O contador do lado direito responde "quantos são?"
 * sem a pessoa ter que contar as linhas.
 */
function TituloSecao({
  children,
  quantidade,
}: {
  children: ReactNode;
  quantidade: number;
}) {
  return (
    <Stack
      direction="row"
      alignItems="baseline"
      justifyContent="space-between"
      sx={{ mb: 1.25, mt: 0.5 }}
    >
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
        {children}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
        {quantidade === 1 ? '1 evento' : `${quantidade} eventos`}
      </Typography>
    </Stack>
  );
}

/** Nenhum evento aberto não é erro: é o estado normal entre dois eventos. */
function SemEventos() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Paper sx={{ borderRadius: 3, p: 3.5, textAlign: 'center' }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          mx: 'auto',
          mb: 1.5,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        <EventAvailableOutlined sx={{ fontSize: 26 }} />
      </Box>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
        Nenhum evento com inscrições abertas
      </Typography>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: '0.875rem',
          color: 'text.secondary',
          maxWidth: 420,
          mx: 'auto',
        }}
      >
        Assim que um evento novo abrir, ele aparece aqui. Enquanto isso, você
        pode acompanhar suas inscrições e pagamentos.
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
        onClick={() => navigate('/minhasInscricoes')}
      >
        Ver minhas inscrições
      </Button>
    </Paper>
  );
}

function Cards() {
  const { data, isLoading } = useGetEvents({});
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data: gruposDoUsuario } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );

  const eventos = useMemo(() => eventosAbertos(data), [data]);

  /**
   * Em quais destes eventos o usuário já está — a linha diz isso na cara, para
   * ninguém tentar se inscrever duas vezes nem precisar abrir "Minhas
   * inscrições" para conferir. Os grupos vêm com o `eventId`, que é o que liga
   * uma coisa na outra.
   */
  const situacaoPorEvento = useMemo(() => {
    const mapa = new Map<string, MinhaSituacao>();

    (gruposDoUsuario?.waitlist || []).forEach((grupo) => {
      if (grupo.eventId) mapa.set(grupo.eventId, 'espera');
    });
    // inscrito ganha da lista de espera: quem tem as duas coisas já está dentro
    (gruposDoUsuario?.present || []).forEach((grupo) => {
      if (grupo.eventId) mapa.set(grupo.eventId, 'inscrito');
    });

    return mapa;
  }, [gruposDoUsuario]);

  if (isLoading) {
    return (
      <Box>
        <TituloSecao quantidade={2}>Próximos eventos</TituloSecao>
        <Stack gap={1.5}>
          <EsqueletoLinha />
          <EsqueletoLinha />
        </Stack>
      </Box>
    );
  }

  if (eventos.length === 0) {
    return <SemEventos />;
  }

  /**
   * "Próximos" são os que já têm contagem regressiva — até 45 dias, ou já
   * acontecendo. O resto fica em "Outros eventos", que é onde caem as inscrições
   * abertas com muita antecedência.
   *
   * O primeiro da lista entra em "Próximos" de qualquer jeito: se todo evento
   * aberto ainda está longe, a página começaria por "Outros eventos", o que soa
   * estranho para quem chegou.
   */
  const proximos = eventos.filter(
    (event, posicao) =>
      posicao === 0 || contagemRegressiva(event.startDate, event.endDate)
  );
  const outros = eventos.filter((event) => !proximos.includes(event));

  const linha = (event: Event, proximo?: boolean) => (
    <LinhaEvento
      key={event.id}
      event={event}
      proximo={proximo}
      minhaSituacao={situacaoPorEvento.get(event.id) ?? null}
    />
  );

  return (
    <Box>
      <TituloSecao quantidade={proximos.length}>Próximos eventos</TituloSecao>
      <Stack gap={1.5}>
        {proximos.map((event, posicao) => linha(event, posicao === 0))}
      </Stack>

      {outros.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <TituloSecao quantidade={outros.length}>Outros eventos</TituloSecao>
          <Stack gap={1.5}>{outros.map((event) => linha(event))}</Stack>
        </Box>
      )}
    </Box>
  );
}

export { Cards };
