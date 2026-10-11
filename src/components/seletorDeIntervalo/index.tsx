import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  Divider,
  InputAdornment,
  Popover,
  Stack,
  SxProps,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowForward, CalendarMonth } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DateTimePickerTabs } from '@mui/x-date-pickers/DateTimePicker';
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Do instante `de` ao `ate`, em data e hora. `ate` já vem no fim do minuto
 * (18:00:59.999), então "até 18:00" inclui o que aconteceu às 18:00:40.
 * Sem `ate`, vai até agora.
 */
export type Intervalo = { de: Date; ate: Date | null };

/** Largura do calendário do MUI; o resto do painel se mede por ela */
const LARGURA_DO_CALENDARIO = 320;
/** Altura das colunas de hora: a mesma das seis semanas do calendário */
const ALTURA_DO_RELOGIO = 288;

type PropsDoDia = PickersDayProps<Date> & { intervalo?: Intervalo };

/**
 * O dia com a faixa do intervalo por trás: as pontas em círculo cheio, e uma
 * faixa contínua ligando uma à outra, arredondada nas pontas e nas bordas da
 * semana.
 */
function DiaDoIntervalo({ intervalo, day, ...outros }: PropsDoDia) {
  const de = intervalo?.de;
  const ate = intervalo?.ate;
  const ehInicio = !!de && isSameDay(day, de);
  const ehFim = !!ate && isSameDay(day, ate);
  const naFaixa =
    !!de &&
    !!ate &&
    !outros.outsideCurrentMonth &&
    !isSameDay(de, ate) &&
    !isBefore(day, startOfDay(de)) &&
    !isAfter(day, endOfDay(ate));
  const fechaEsquerda = ehInicio || day.getDay() === 0;
  const fechaDireita = ehFim || day.getDay() === 6;

  return (
    <Box
      sx={(theme) => ({
        px: '2px',
        backgroundColor: naFaixa
          ? alpha(theme.palette.primary.main, 0.16)
          : 'transparent',
        borderTopLeftRadius: fechaEsquerda ? 18 : 0,
        borderBottomLeftRadius: fechaEsquerda ? 18 : 0,
        borderTopRightRadius: fechaDireita ? 18 : 0,
        borderBottomRightRadius: fechaDireita ? 18 : 0,
      })}
    >
      <PickersDay
        {...outros}
        day={day}
        selected={!outros.outsideCurrentMonth && (ehInicio || ehFim)}
        sx={{ m: 0 }}
      />
    </Box>
  );
}

/** O dia de `dia` com a hora e o minuto de `hora` */
const comHora = (dia: Date, hora: Date) => {
  const nova = new Date(dia);
  nova.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
  return nova;
};

/** O fim do minuto: o `ate` inclui o minuto escolhido inteiro */
const fimDoMinuto = (data: Date) =>
  new Date(new Date(data).setSeconds(59, 999));

/** No campo, o ano só aparece quando não é o atual: "05/10 22:44" */
const quando = (data: Date) =>
  format(
    data,
    data.getFullYear() === new Date().getFullYear()
      ? 'dd/MM HH:mm'
      : 'dd/MM/yyyy HH:mm'
  );

/** Uma ponta no topo do painel: diz qual delas o calendário está ajustando */
function Ponta({
  rotulo,
  data,
  ativa,
  onClick,
}: {
  rotulo: string;
  data: Date | null;
  ativa: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: `1px solid ${
          ativa ? theme.palette.primary.main : theme.palette.divider
        }`,
        backgroundColor: ativa
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
        transition: theme.transitions.create([
          'border-color',
          'background-color',
        ]),
      })}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: ativa ? 'primary.main' : 'text.secondary',
        }}
      >
        {rotulo}
      </Typography>
      {/* a hora desce para a linha de baixo quando o cartão é estreito (celular
          pequeno), em vez de vazar por baixo da seta */}
      <Typography
        component="span"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: 1,
          fontSize: 15,
          fontWeight: 600,
          mt: 0.25,
          textAlign: 'left',
        }}
      >
        <span>{data ? format(data, 'dd/MM/yyyy') : 'Agora'}</span>
        {data && (
          <Box component="span" sx={{ color: 'text.secondary' }}>
            {format(data, 'HH:mm')}
          </Box>
        )}
      </Typography>
    </ButtonBase>
  );
}

/**
 * Um campo só para o intervalo, com data, hora e minuto, no jeito do
 * DateTimePicker do MUI.
 *
 * Em cima, as duas pontas (Início e Fim): a marcada é a que o calendário e o
 * relógio ajustam. Escolher o dia do início passa sozinho para o fim; o fim
 * novo entra às 23:59. Sem fim, o intervalo vai até agora, e "Até agora" volta
 * a isso. Um dia de fim antes do início recomeça por ele. Tudo fica num
 * rascunho até o OK; Cancelar ou clicar fora descarta.
 *
 * ```tsx
 * const [intervalo, setIntervalo] = useState<Intervalo>({ de: ontem, ate: null });
 * <SeletorDeIntervalo value={intervalo} onChange={setIntervalo} />
 * // na consulta: from = intervalo.de, to = intervalo.ate ?? (nada: agora)
 * ```
 *
 * ponytail: feito à mão com o `DateCalendar` e o `MultiSectionDigitalClock`,
 * porque o `DateRangePicker` do MUI X é da versão paga (Pro).
 */
function SeletorDeIntervalo({
  value,
  onChange,
  label = 'Período',
  sx,
}: {
  value: Intervalo;
  onChange: (intervalo: Intervalo) => void;
  label?: string;
  /** do campo; a largura padrão é 260px */
  sx?: SxProps<Theme>;
}) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  // o que está sendo escolhido no painel: só vira `value` no OK
  const [rascunho, setRascunho] = useState<Intervalo>(value);
  // qual ponta o calendário e o relógio estão ajustando
  const [ponta, setPonta] = useState<'de' | 'ate'>('de');
  // no celular não cabem lado a lado: calendário e horário viram abas, como
  // no DateTimePicker do MUI
  const celular = useMediaQuery(useTheme().breakpoints.down('sm'));
  const [vista, setVista] = useState<'day' | 'hours'>('day');

  const texto = value.ate
    ? `${quando(value.de)} – ${
        isSameDay(value.de, value.ate)
          ? format(value.ate, 'HH:mm')
          : quando(value.ate)
      }`
    : `${quando(value.de)} – agora`;

  const escolherDia = (dia: Date | null) => {
    if (!dia) return;
    const { de, ate } = rascunho;
    if (ponta === 'de') {
      const novo = comHora(dia, de);
      // o fim que ficou antes do início novo não vale mais
      setRascunho({ de: novo, ate: ate && isBefore(ate, novo) ? null : ate });
      setPonta('ate');
      return;
    }
    if (isBefore(dia, startOfDay(de))) {
      setRascunho({ de: comHora(dia, de), ate: null });
      return;
    }
    setRascunho({ de, ate: fimDoMinuto(comHora(dia, ate ?? endOfDay(dia))) });
  };

  const escolherHora = (hora: Date | null) => {
    if (!hora) return;
    const { de, ate } = rascunho;
    if (ponta === 'de') setRascunho({ de: comHora(de, hora), ate });
    else if (ate) setRascunho({ de, ate: fimDoMinuto(comHora(ate, hora)) });
  };

  const fechar = () => setAncora(null);

  const invertido = !!rascunho.ate && isBefore(rascunho.ate, rascunho.de);
  const daPonta = ponta === 'de' ? rascunho.de : rascunho.ate;

  return (
    <>
      <TextField
        size="small"
        label={label}
        value={texto}
        onClick={(evento) => {
          setRascunho(value);
          setPonta('de');
          setVista('day');
          setAncora(evento.currentTarget);
        }}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <CalendarMonth fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={[
          { width: 260, '& input': { cursor: 'pointer' } },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
      <Popover
        open={!!ancora}
        anchorEl={ancora}
        onClose={fechar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            // só o meio rola: as pontas e o OK ficam sempre à vista no celular
            sx: {
              mt: 1,
              borderRadius: 3,
              maxWidth: 'calc(100vw - 16px)',
              // no celular a largura é fixa (a tela menos 16px de cada lado,
              // a margem do Popover): solta, ela seguia o conteúdo — 280px com
              // o fim em "agora", 357px com data — e o painel pulava de lado
              ...(celular && { width: 'calc(100vw - 32px)', maxWidth: 400 }),
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          {/* os cartões esticam juntos: quando a hora de um desce de linha, o
              outro acompanha a altura */}
          <Stack direction="row" alignItems="stretch" gap={1} sx={{ p: 1.5 }}>
            <Ponta
              rotulo="Início"
              data={rascunho.de}
              ativa={ponta === 'de'}
              onClick={() => setPonta('de')}
            />
            <ArrowForward
              sx={{
                fontSize: 18,
                color: 'text.disabled',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            />
            <Ponta
              rotulo="Fim"
              data={rascunho.ate}
              ativa={ponta === 'ate'}
              onClick={() => setPonta('ate')}
            />
          </Stack>
          {celular ? (
            <DateTimePickerTabs
              view={vista}
              onViewChange={(nova) =>
                setVista(nova === 'day' ? 'day' : 'hours')
              }
              hidden={false}
            />
          ) : (
            <Divider />
          )}

          <Stack direction="row" sx={{ overflowY: 'auto', minHeight: 0 }}>
            {(!celular || vista === 'day') && (
              <DateCalendar
                value={daPonta}
                referenceDate={rascunho.ate ?? rascunho.de}
                onChange={escolherDia}
                disableFuture
                showDaysOutsideCurrentMonth={false}
                slots={{ day: DiaDoIntervalo }}
                slotProps={{
                  day: { intervalo: rascunho } as Partial<
                    PickersDayProps<unknown>
                  >,
                }}
                sx={{
                  // no celular cabe na tela: os 7 dias somam 280px, e o
                  // painel de 320px estourava a tela de 320px
                  width: celular ? '100%' : LARGURA_DO_CALENDARIO,
                  flexShrink: 0,
                  m: 0,
                  height: 'auto',
                  '& .MuiPickersCalendarHeader-root': { pl: 2.5 },
                  '& .MuiPickersCalendarHeader-label': {
                    textTransform: 'capitalize',
                  },
                  // a faixa do intervalo encosta de um dia no outro
                  '& .MuiDayCalendar-weekContainer': {
                    justifyContent: 'center',
                    my: '2px',
                  },
                  '& .MuiDayCalendar-header': { justifyContent: 'center' },
                  '& .MuiDayCalendar-weekDayLabel': { width: 40, m: 0 },
                  '& .MuiPickersSlideTransition-root': {
                    minHeight: ALTURA_DO_RELOGIO - 48,
                  },
                }}
              />
            )}

            {!celular && <Divider orientation="vertical" flexItem />}

            {(!celular || vista === 'hours') && (
              // no celular, a aba ocupa o lugar do calendário, do mesmo tamanho:
              // o painel não muda de tamanho ao trocar de aba
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: celular ? 'center' : 'stretch',
                  pt: 2,
                  width: celular ? '100%' : 152,
                  minHeight: celular ? ALTURA_DO_RELOGIO + 48 : undefined,
                }}
              >
                <Typography
                  sx={{
                    px: 2,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                  }}
                >
                  Horário {ponta === 'de' ? 'do início' : 'do fim'}
                </Typography>
                {daPonta ? (
                  <MultiSectionDigitalClock
                    // a chave remonta o relógio ao trocar de ponta: é na montagem
                    // que ele rola até a hora marcada
                    key={ponta}
                    value={daPonta}
                    onChange={escolherHora}
                    ampm={false}
                    timeSteps={{ minutes: 1 }}
                    sx={{
                      px: 1,
                      pt: 1,
                      borderBottom: 0,
                      justifyContent: 'center',
                      '& .MuiMultiSectionDigitalClockSection-root': {
                        width: 64,
                        maxHeight: ALTURA_DO_RELOGIO,
                        borderLeft: 0,
                        '&::after': { display: 'none' },
                        // barra de rolagem fininha, que só aparece com o mouse
                        // em cima. O MUI liga a rolagem só no hover, e o
                        // espaço da barra que surgia empurrava os números de
                        // lado: aqui ela fica sempre ligada, transparente em
                        // repouso.
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'transparent transparent',
                        '&:hover': {
                          overflowY: 'auto',
                          scrollbarColor: (theme: Theme) =>
                            `${alpha(theme.palette.text.primary, 0.3)} transparent`,
                        },
                      },
                      '& .MuiMultiSectionDigitalClockSection-item': {
                        width: 52,
                        mx: 'auto',
                        borderRadius: 2,
                        justifyContent: 'center',
                      },
                    }}
                  />
                ) : (
                  // fim em "agora": não há hora para marcar até escolher o dia
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ px: 2, pt: 2, maxWidth: celular ? 260 : 150 }}
                  >
                    O fim é agora. Escolha um dia no calendário para definir
                    outro fim.
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
          <Divider />

          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ px: 1.5, py: 1.25 }}
          >
            <Button
              size="small"
              onClick={() => setRascunho({ ...rascunho, ate: null })}
              disabled={!rascunho.ate}
              sx={{ textTransform: 'none' }}
            >
              Fim em agora
            </Button>
            <Box sx={{ flex: 1 }} />
            {invertido && (
              <Typography variant="caption" color="error">
                O fim está antes do início
              </Typography>
            )}
            <Button
              size="small"
              color="inherit"
              onClick={fechar}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={invertido}
              onClick={() => {
                onChange(rascunho);
                fechar();
              }}
              sx={{ textTransform: 'none', minWidth: 72 }}
            >
              OK
            </Button>
          </Stack>
        </LocalizationProvider>
      </Popover>
    </>
  );
}

export { SeletorDeIntervalo };
