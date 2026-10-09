import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import dayjs from 'dayjs';
import { NewsSchedule } from '../types';
import { problemaDoAgendamento } from '../utils';

/** 0 = domingo, como o `getDay` do JavaScript e o backend */
const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const NOMES_DOS_DIAS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];

/** `runAt` (ISO) → o valor que o `datetime-local` entende, no fuso do navegador */
const paraCampo = (iso?: string | null) =>
  iso ? dayjs(iso).format('YYYY-MM-DDTHH:mm') : '';

interface AgendamentosDaNoticiaProps {
  value: NewsSchedule[];
  onChange: (agendamentos: NewsSchedule[]) => void;
  /** mostra o que falta em cada linha — só depois da primeira tentativa */
  mostrarProblemas?: boolean;
  /**
   * "Uma vez" que já passou: aparece desabilitado, como histórico. Não é
   * validado nem volta no salvar — o backend o mantém.
   */
  disparados?: NewsSchedule[];
}

/**
 * Agendamentos de disparo da notícia: quantos o admin quiser, cada um "uma
 * vez" (data e hora) ou "toda semana" (dias e horário).
 */
function AgendamentosDaNoticia({
  value,
  onChange,
  mostrarProblemas,
  disparados = [],
}: AgendamentosDaNoticiaProps) {
  const trocar = (indice: number, parte: Partial<NewsSchedule>) =>
    onChange(
      value.map((agendamento, i) =>
        i === indice ? { ...agendamento, ...parte } : agendamento
      )
    );

  return (
    <Stack gap={1.5}>
      {disparados.map((agendamento) => (
        <Box
          key={agendamento.id}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            opacity: 0.7,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            gap={1.5}
          >
            <TextField
              select
              size="small"
              disabled
              value="ONCE"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="ONCE">Uma vez</MenuItem>
            </TextField>
            <TextField
              type="datetime-local"
              size="small"
              disabled
              value={paraCampo(agendamento.runAt)}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            {agendamento.lastRunAt
              ? `Disparado em ${dayjs(agendamento.lastRunAt).format(
                  'DD/MM [às] HH:mm'
                )}`
              : 'Não disparou: o servidor estava fora do ar no horário'}
          </Typography>
        </Box>
      ))}

      {value.map((agendamento, indice) => {
        const problema = mostrarProblemas
          ? problemaDoAgendamento(agendamento)
          : null;

        return (
          <Box
            key={agendamento.id ?? `novo-${indice}`}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: problema ? 'error.main' : 'divider',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              gap={1.5}
            >
              <TextField
                select
                size="small"
                value={agendamento.kind}
                sx={{ minWidth: 150 }}
                onChange={(evento) =>
                  trocar(indice, {
                    kind: evento.target.value as NewsSchedule['kind'],
                  })
                }
              >
                <MenuItem value="ONCE">Uma vez</MenuItem>
                <MenuItem value="WEEKLY">Toda semana</MenuItem>
              </TextField>

              {agendamento.kind === 'ONCE' ? (
                <TextField
                  type="datetime-local"
                  size="small"
                  value={paraCampo(agendamento.runAt)}
                  inputProps={{ min: dayjs().format('YYYY-MM-DDTHH:mm') }}
                  sx={{ flex: 1 }}
                  onChange={(evento) =>
                    trocar(indice, {
                      runAt: evento.target.value
                        ? new Date(evento.target.value).toISOString()
                        : null,
                    })
                  }
                />
              ) : (
                <>
                  <ToggleButtonGroup
                    size="small"
                    value={agendamento.weekdays ?? []}
                    onChange={(_, dias: number[]) =>
                      trocar(indice, { weekdays: [...dias].sort() })
                    }
                    aria-label="Dias da semana"
                  >
                    {DIAS.map((letra, dia) => (
                      <ToggleButton
                        key={dia}
                        value={dia}
                        aria-label={NOMES_DOS_DIAS[dia]}
                        title={NOMES_DOS_DIAS[dia]}
                        sx={{
                          width: 34,
                          fontWeight: 700,
                          // o padrão do MUI quase não difere do desmarcado
                          '&.Mui-selected, &.Mui-selected:hover': {
                            color: 'primary.contrastText',
                            backgroundColor: 'primary.main',
                          },
                        }}
                      >
                        {letra}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <TextField
                    type="time"
                    size="small"
                    value={agendamento.time ?? ''}
                    sx={{ width: { xs: '100%', sm: 120 } }}
                    onChange={(evento) =>
                      trocar(indice, { time: evento.target.value || null })
                    }
                  />
                </>
              )}

              <IconButton
                size="small"
                aria-label="Remover agendamento"
                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                onClick={() => onChange(value.filter((_, i) => i !== indice))}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Stack>

            {(problema || agendamento.nextRunAt) && (
              <Typography
                variant="caption"
                color={problema ? 'error' : 'text.secondary'}
                sx={{ display: 'block', mt: 1 }}
              >
                {problema ??
                  `Próximo disparo: ${dayjs(agendamento.nextRunAt).format(
                    'DD/MM [às] HH:mm'
                  )}`}
              </Typography>
            )}
          </Box>
        );
      })}

      <Button
        startIcon={<Add />}
        size="small"
        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
        onClick={() =>
          onChange([...value, { kind: 'WEEKLY', weekdays: [], time: '12:00' }])
        }
      >
        Adicionar agendamento
      </Button>
    </Stack>
  );
}

export { AgendamentosDaNoticia };
