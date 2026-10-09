import { useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { ptBR } from 'date-fns/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { superficieSx } from '../../../components/listPageStyles';
import { useGetNewsCalendar } from '../api/getNewsCalendar';
import { NewsCalendar } from '../types';

/** Um disparo no calendário: feito (histórico) ou agendado (por vir) */
type Disparo =
  | ({ tipo: 'feito' } & NewsCalendar['feitos'][number])
  | ({ tipo: 'agendado' } & NewsCalendar['agendados'][number]);

const ORIGEM = {
  PUBLISH: 'Publicação',
  MANUAL: 'Reenvio',
  SCHEDULE: 'Agendado',
};

const chaveDoDia = (data: Date | string) => dayjs(data).format('YYYY-MM-DD');

function Bolinha({ cor }: { cor: string }) {
  return (
    <Box
      sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: cor }}
    />
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Box
        sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cor }}
      />
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        {texto}
      </Typography>
    </Stack>
  );
}

type DiaProps = PickersDayProps<Date> & {
  disparosDoDia?: Map<string, Disparo[]>;
};

/**
 * O dia com uma bolinha por tipo de disparo: verde para o que já saiu, azul
 * para o que está agendado. A dica lista as notícias do dia.
 */
function DiaDoCalendario({ disparosDoDia, ...props }: DiaProps) {
  const theme = useTheme();
  const disparos = props.outsideCurrentMonth
    ? undefined
    : disparosDoDia?.get(chaveDoDia(props.day));

  const temFeito = disparos?.some((d) => d.tipo === 'feito');
  const temAgendado = disparos?.some((d) => d.tipo === 'agendado');

  const dia = (
    <Box sx={{ position: 'relative' }}>
      <PickersDay {...props} sx={disparos ? { fontWeight: 700 } : undefined} />
      {disparos && (
        <Stack
          direction="row"
          gap={0.375}
          sx={{
            position: 'absolute',
            bottom: 3,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        >
          {temFeito && <Bolinha cor={theme.palette.chips.success} />}
          {temAgendado && <Bolinha cor={theme.palette.chips.info} />}
        </Stack>
      )}
    </Box>
  );

  return disparos ? (
    <Tooltip
      arrow
      title={[...new Set(disparos.map((d) => d.news.title))].join(' · ')}
    >
      {dia}
    </Tooltip>
  ) : (
    dia
  );
}

function LinhaDoDisparo({ disparo }: { disparo: Disparo }) {
  const theme = useTheme();

  const situacao =
    disparo.tipo === 'agendado'
      ? { texto: 'Agendado', cor: theme.palette.chips.info }
      : disparo.sent
        ? {
            texto: `Enviado · ${disparo.sent} grupo(s)`,
            cor: theme.palette.chips.success,
          }
        : { texto: 'Não saiu', cor: theme.palette.chips.canceled };

  const detalhe =
    disparo.tipo === 'agendado'
      ? disparo.kind === 'WEEKLY'
        ? 'Toda semana'
        : 'Uma vez'
      : [
          ORIGEM[disparo.origin],
          disparo.failed && `${disparo.failed} falha(s)`,
          disparo.noLink && `${disparo.noLink} sem link`,
        ]
          .filter(Boolean)
          .join(' · ');

  return (
    <Stack direction="row" alignItems="center" gap={1.5} sx={{ py: 1 }}>
      <Typography
        sx={{
          flexShrink: 0,
          width: 44,
          fontSize: '0.875rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {dayjs(disparo.at).format('HH:mm')}
      </Typography>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
          {disparo.news.title}
        </Typography>
        <Typography
          noWrap
          sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
        >
          {detalhe}
        </Typography>
      </Box>

      <Chip
        size="small"
        label={situacao.texto}
        sx={{
          flexShrink: 0,
          fontWeight: 600,
          color: situacao.cor,
          backgroundColor: alpha(situacao.cor, 0.12),
        }}
      />
    </Stack>
  );
}

/**
 * Calendário de disparos da tela de notícias: o que já saiu no WhatsApp e o
 * que está agendado, mês a mês. Ao lado, os disparos do dia escolhido.
 */
function CalendarioDeDisparos() {
  const [mes, setMes] = useState(() => dayjs().startOf('month').toDate());
  const [diaEscolhido, setDiaEscolhido] = useState(() => new Date());

  const inicio = mes;
  const fim = dayjs(mes).add(1, 'month').toDate();
  const { data, isLoading } = useGetNewsCalendar(inicio, fim);

  const disparosDoDia = useMemo(() => {
    const mapa = new Map<string, Disparo[]>();
    const todos: Disparo[] = [
      ...(data?.feitos ?? []).map((d) => ({ ...d, tipo: 'feito' as const })),
      ...(data?.agendados ?? []).map((d) => ({
        ...d,
        tipo: 'agendado' as const,
      })),
    ];

    todos
      .sort((a, b) => dayjs(a.at).valueOf() - dayjs(b.at).valueOf())
      .forEach((disparo) => {
        const chave = chaveDoDia(disparo.at);
        mapa.set(chave, [...(mapa.get(chave) ?? []), disparo]);
      });

    return mapa;
  }, [data]);

  const doDia = disparosDoDia.get(chaveDoDia(diaEscolhido)) ?? [];
  const tituloDoDia = dayjs(diaEscolhido)
    .locale('pt-br')
    .format('dddd, D [de] MMMM');

  return (
    // coluna estreita ao lado da lista de notícias: o calendário em cima e os
    // disparos do dia embaixo
    <Paper
      sx={{
        ...superficieSx,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DateCalendar
            value={diaEscolhido}
            onChange={(dia: Date | null) => dia && setDiaEscolhido(dia)}
            onMonthChange={(novo: Date) => setMes(novo)}
            loading={isLoading}
            slots={{ day: DiaDoCalendario }}
            slotProps={{
              day: { disparosDoDia } as Partial<PickersDayProps<unknown>>,
            }}
            sx={{
              m: 0,
              '& .MuiPickersCalendarHeader-label': {
                textTransform: 'capitalize',
              },
            }}
          />
        </LocalizationProvider>

        <Stack direction="row" gap={2} sx={{ px: 2, mt: -1 }}>
          <Legenda cor="chips.success" texto="Enviado" />
          <Legenda cor="chips.info" texto="Agendado" />
        </Stack>
      </Box>

      <Box sx={{ minWidth: 0, px: 1 }}>
        <Typography
          sx={{
            mb: 1,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Disparos de {tituloDoDia}
        </Typography>

        {doDia.length ? (
          <Stack
            divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}
          >
            {doDia.map((disparo) => (
              <LinhaDoDisparo
                key={
                  disparo.tipo === 'feito'
                    ? disparo.id
                    : `${disparo.scheduleId}-${disparo.at}`
                }
                disparo={disparo}
              />
            ))}
          </Stack>
        ) : (
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
            Nenhum disparo neste dia. Os dias marcados no calendário têm
            disparos enviados ou agendados.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export { CalendarioDeDisparos };
