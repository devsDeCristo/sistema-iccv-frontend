import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { GRUPOS_DO_TIPO, ICONE_DO_TIPO } from '../constants';
import { CategoryEventFormType, EventType } from '../types';

const TIPOS: {
  valor: EventType;
  nome: string;
  descricao: string;
}[] = [
  {
    valor: 'CURSILHO',
    nome: 'Cursilho',
    descricao:
      'Inscrições separadas entre quem vai participar pela primeira vez e quem já fez e vai trabalhar.',
  },
  {
    valor: 'RETIRO',
    nome: 'Retiro',
    descricao:
      'Inscrição completa ou por diária, com o preço separado por faixa de idade.',
  },
  {
    valor: 'OUTRO',
    nome: 'Outro',
    descricao:
      'Qualquer outro evento. Sem pré-configuração: você cria os grupos de inscrição do zero.',
  },
];

interface SelectCategoryEventProps {
  selectEventType: (eventType: EventType) => void;
}

/**
 * Passo 1 do cadastro: o tipo do evento. O tipo só decide os grupos de
 * inscrição que já vêm prontos (`GRUPOS_DO_TIPO`) — e o cartão mostra quais,
 * lidos da mesma constante, para a tela não prometer o que o passo de grupos
 * não traz.
 */
function SelectCategoryEvent({ selectEventType }: SelectCategoryEventProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CategoryEventFormType>();
  const eventSelected = useWatch({ control, name: 'eventType' });

  useEffect(() => {
    if (eventSelected) {
      selectEventType(eventSelected);
    }
  }, [eventSelected]);

  const theme = useTheme();
  const destaque = theme.palette.primary.main;
  const escuro = theme.palette.mode === 'dark';

  return (
    <Controller
      name="eventType"
      control={control}
      rules={{ required: 'Selecione o tipo de evento' }}
      render={({ field }) => (
        <Stack gap={2}>
          <Box>
            <Typography variant="h6" fontSize={18}>
              Que tipo de evento é?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              O tipo define os grupos de inscrição que já vêm prontos. No passo
              de grupos dá para mudar tudo.
            </Typography>
          </Box>

          <Grid
            container
            spacing={2}
            role="radiogroup"
            aria-label="Tipo do evento"
          >
            {TIPOS.map(({ valor, nome, descricao }) => {
              const Icone = ICONE_DO_TIPO[valor];
              const marcado = field.value === valor;
              const grupos = GRUPOS_DO_TIPO[valor];

              return (
                <Grid item xs={12} md={4} key={valor}>
                  <ButtonBase
                    role="radio"
                    aria-checked={marcado}
                    onClick={() => field.onChange(valor)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      p: 2,
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      textAlign: 'left',
                      // o contorno é sombra por dentro: engrossar ao marcar
                      // não empurra o conteúdo
                      boxShadow: marcado
                        ? `inset 0 0 0 2px ${destaque}`
                        : `inset 0 0 0 1px ${theme.palette.divider}`,
                      bgcolor: marcado
                        ? alpha(destaque, escuro ? 0.14 : 0.06)
                        : 'background.paper',
                      transition: theme.transitions.create([
                        'box-shadow',
                        'background-color',
                        'transform',
                      ]),
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        ...(!marcado && {
                          boxShadow: `inset 0 0 0 1px ${alpha(destaque, 0.5)}, ${theme.shadows[3]}`,
                        }),
                      },
                      '&.Mui-focusVisible': {
                        outline: `2px solid ${destaque}`,
                        outlineOffset: 2,
                      },
                      '@media (prefers-reduced-motion: reduce)': {
                        '&:hover': { transform: 'none' },
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      sx={{ mb: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          color: marcado ? '#fff' : destaque,
                          bgcolor: marcado ? destaque : alpha(destaque, 0.12),
                          transition: theme.transitions.create([
                            'background-color',
                            'color',
                          ]),
                        }}
                      >
                        <Icone />
                      </Box>
                      {marcado ? (
                        <CheckCircle sx={{ color: destaque }} />
                      ) : (
                        <RadioButtonUnchecked sx={{ color: 'text.disabled' }} />
                      )}
                    </Stack>

                    <Typography fontWeight={700} fontSize={17}>
                      {nome}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, mb: 2 }}
                    >
                      {descricao}
                    </Typography>

                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 1.5,
                        borderTop: `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.75 }}
                      >
                        {grupos.length ? 'Já vem com' : 'Nenhum grupo pronto'}
                      </Typography>
                      {grupos.length > 0 && (
                        <Stack direction="row" gap={0.75} flexWrap="wrap">
                          {grupos.map((grupo) => (
                            <Chip
                              key={grupo.name}
                              label={grupo.name}
                              size="small"
                              color="secondary"
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </ButtonBase>
                </Grid>
              );
            })}
          </Grid>

          {errors.eventType ? (
            <Typography color="error" variant="caption">
              {errors.eventType.message as string}
            </Typography>
          ) : null}
        </Stack>
      )}
    />
  );
}

export { SelectCategoryEvent };
