import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { CalendarMonthOutlined } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { ptBR } from 'date-fns/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { useGetGroupsByUser } from '../../admin/events/api/getGroupsByUser';
import { emAndamento } from '../../admin/events/utils/eventStatus';
import { ehCorHex } from '../../admin/events/eventColors';
import { Event, PayLoadGroup } from '../../admin/events/types';
import { formatarPeriodo, jaAcabou } from '../utils';

/** evento longo (um acampamento de mês) não precisa marcar dia a dia além disso */
const DIAS_MARCADOS_POR_EVENTO = 62;

type MeuEvento = { event: Event; naEspera: boolean };

/** Os dias de cada evento, pela data do dia: a chave do calendário */
function diasDosEventos(eventos: MeuEvento[]) {
  const mapa = new Map<string, Event[]>();

  eventos.forEach(({ event }) => {
    const dia = dayjs(event.startDate).startOf('day');
    const fim = dayjs(event.endDate ?? event.startDate).startOf('day');
    if (!dia.isValid()) return;

    for (
      let atual = dia, passos = 0;
      !atual.isAfter(fim) && passos < DIAS_MARCADOS_POR_EVENTO;
      atual = atual.add(1, 'day'), passos++
    ) {
      const chave = atual.toDate().toDateString();
      mapa.set(chave, [...(mapa.get(chave) ?? []), event]);
    }
  });

  return mapa;
}

type DiaProps = PickersDayProps<Date> & { eventosDoDia?: Map<string, Event[]> };

/** A cor do evento (a mesma paleta da página dele), ou o azul do sistema */
function corDoEvento(event: Event, corPadrao: string) {
  return ehCorHex(event.data?.colors?.primary)
    ? event.data!.colors!.primary!
    : corPadrao;
}

/**
 * O dia do calendário, pintado quando cai num evento da pessoa — na cor do
 * próprio evento (a mesma paleta da página dele), e não numa cor genérica do
 * sistema: é o que deixa claro, olhando o mês inteiro, que um bloco de dias é
 * de um evento e outro bloco é de outro.
 *
 * Dois eventos no mesmo dia (raro) dividem o dia: a marcação usa a cor do
 * primeiro, e o nome dos dois aparece na dica ao passar o mouse.
 */
function DiaDoCalendario({ eventosDoDia, ...props }: DiaProps) {
  const theme = useTheme();
  const eventos = props.outsideCurrentMonth
    ? undefined
    : eventosDoDia?.get(props.day.toDateString());

  const cor = eventos && corDoEvento(eventos[0], theme.palette.primary.main);

  const dia = (
    <PickersDay
      {...props}
      sx={
        eventos
          ? {
              fontWeight: 700,
              color: cor,
              backgroundColor: alpha(cor, 0.16),
              '&:hover, &:focus': { backgroundColor: alpha(cor, 0.24) },
            }
          : undefined
      }
    />
  );

  // o `title` nativo demora ~1s para aparecer e passa despercebido; a dica do
  // MUI abre na hora e segue o tema
  return eventos ? (
    <Tooltip title={eventos.map((event) => event.name).join(' · ')} arrow>
      {dia}
    </Tooltip>
  ) : (
    dia
  );
}

function LinhaDoEvento({ event, naEspera }: MeuEvento) {
  const theme = useTheme();
  const navigate = useNavigate();
  const inicio = dayjs(event.startDate).locale('pt-br');
  const cor = corDoEvento(event, theme.palette.primary.main);

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/eventos/${event.id}`)}
      onKeyDown={(tecla) => {
        if (tecla.key === 'Enter') navigate(`/eventos/${event.id}`);
      }}
      sx={{
        p: 1,
        pl: 1.25,
        mx: -1,
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover, &:focus-visible': {
          backgroundColor: theme.palette.background.hover,
        },
        '&:hover .nome-do-evento': { color: theme.palette.primary.main },
      }}
    >
      {/* a barra na cor do evento — a mesma do calendário — para quem tem
          vários eventos na lista achar de relance o dia dele lá em cima */}
      <Box
        sx={{
          flexShrink: 0,
          alignSelf: 'stretch',
          width: 4,
          borderRadius: 999,
          backgroundColor: cor,
        }}
      />

      {/* a data em bloco, como folhinha: é o que a pessoa procura primeiro */}
      <Box
        sx={{
          flexShrink: 0,
          width: 44,
          py: 0.5,
          borderRadius: 2,
          textAlign: 'center',
          color: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
        <Typography
          sx={{ fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.1 }}
        >
          {inicio.format('D')}
        </Typography>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {inicio.format('MMM').replace('.', '')}
        </Typography>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          className="nome-do-evento"
          noWrap
          sx={{ fontSize: '0.9375rem', fontWeight: 600 }}
        >
          {event.name}
        </Typography>
        <Typography
          noWrap
          sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
        >
          {formatarPeriodo(event.startDate, event.endDate)}
          {naEspera && ' · Lista de espera'}
        </Typography>
      </Box>
    </Stack>
  );
}

function Secao({ titulo, eventos }: { titulo: string; eventos: MeuEvento[] }) {
  if (!eventos.length) return null;

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 0.5,
        }}
      >
        {titulo}
      </Typography>
      <Stack gap={0.5}>
        {eventos.map((meu) => (
          <LinhaDoEvento key={meu.event.id} {...meu} />
        ))}
      </Stack>
    </Box>
  );
}

/**
 * A agenda de quem está logado: o calendário com os dias dos eventos em que a
 * pessoa está inscrita marcados, e a lista deles embaixo — primeiro o que está
 * acontecendo, depois o que vem, por data. O que já acabou não entra.
 *
 * Usa as mesmas consultas do catálogo ao lado (eventos e grupos do usuário),
 * que o react-query já tem em cache: o card não pede nada a mais ao servidor.
 */
function MinhaAgenda() {
  const theme = useTheme();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data, isLoading: carregandoEventos } = useGetEvents({});
  const { data: grupos, isLoading: carregandoGrupos } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );

  const meusEventos = useMemo<MeuEvento[]>(() => {
    const { present = [], waitlist = [] } = (grupos ?? {}) as PayLoadGroup;
    const inscrito = new Set(present.map((grupo) => grupo.eventId));
    const naEspera = new Set(waitlist.map((grupo) => grupo.eventId));

    return (
      (Array.isArray(data) ? (data as Event[]) : [])
        .filter(
          (event) =>
            (inscrito.has(event.id) || naEspera.has(event.id)) &&
            !jaAcabou(event)
        )
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        // inscrito ganha da lista de espera: quem tem as duas coisas já está dentro
        .map((event) => ({ event, naEspera: !inscrito.has(event.id) }))
    );
  }, [data, grupos]);

  const acontecendo = meusEventos.filter(({ event }) => emAndamento(event));
  const proximos = meusEventos.filter((meu) => !acontecendo.includes(meu));
  const eventosDoDia = useMemo(
    () => diasDosEventos(meusEventos),
    [meusEventos]
  );

  // o calendário abre no mês do que está acontecendo, ou do próximo — e não
  // num mês vazio, quando o evento é daqui a dois meses
  const mesInicial = acontecendo.length
    ? new Date()
    : proximos.length
      ? new Date(proximos[0].event.startDate)
      : new Date();

  const carregando = carregandoEventos || (!!userId && carregandoGrupos);

  return (
    <Paper sx={{ borderRadius: 3, p: 2 }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          }}
        >
          <CalendarMonthOutlined sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
          Agenda de Inscrições
        </Typography>
      </Stack>

      {carregando ? (
        <Stack gap={1.5} sx={{ mt: 1.5 }}>
          <Skeleton variant="rounded" height={280} />
          <Skeleton variant="rounded" height={52} />
        </Stack>
      ) : (
        <>
          {/* o calendário do sistema está sem idioma: aqui ele fala português */}
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DateCalendar
              // o mês inicial só vale na montagem: a chave o renova quando a
              // agenda muda
              key={mesInicial.toDateString()}
              referenceDate={mesInicial}
              value={null}
              readOnly
              slots={{ day: DiaDoCalendario }}
              slotProps={{
                day: { eventosDoDia } as Partial<PickersDayProps<unknown>>,
              }}
              sx={{
                width: '100%',
                maxWidth: 340,
                height: 'fit-content',
                mx: 'auto',
                '& .MuiPickersCalendarHeader-label': {
                  textTransform: 'capitalize',
                },
              }}
            />
          </LocalizationProvider>

          {meusEventos.length === 0 ? (
            <Typography
              sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.5 }}
            >
              Você não tem inscrição em eventos que vêm por aí. Quando se
              inscrever, eles aparecem aqui e ficam marcados no calendário.
            </Typography>
          ) : (
            <Stack sx={{ mt: 0.5 }}>
              <Secao titulo="Acontecendo agora" eventos={acontecendo} />
              <Secao titulo="Meus eventos" eventos={proximos} />
            </Stack>
          )}
        </>
      )}
    </Paper>
  );
}

export { MinhaAgenda };
