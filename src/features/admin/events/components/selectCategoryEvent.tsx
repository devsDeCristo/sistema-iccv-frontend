import { alpha, Box, Grid, Radio, Typography, useTheme } from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { CategoryEventFormType, EventType } from '../types';
import { Backpack, Class } from '@mui/icons-material';
import { useEffect } from 'react';
interface SelectCategoryEventProps {
  selectEventType: (eventType: EventType) => void;
}
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
  return (
    <Controller
      name="eventType"
      control={control}
      rules={{ required: 'Selecione o tipo de evento' }}
      render={({ field }) => (
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Typography variant="h6">
              Selecione qual tipo de evento deseja criar
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              onClick={() => field.onChange('CURSILHO')}
              sx={{
                border:
                  field.value === 'CURSILHO'
                    ? `1px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  field.value === 'CURSILHO'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.text.primary, 0.02),
                padding: '16px',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  ...(field.value !== 'CURSILHO'
                    ? {
                        backgroundColor: alpha(
                          theme.palette.text.primary,
                          0.08
                        ),
                      }
                    : {}),
                },
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              {field.value === 'CURSILHO' ? (
                <Class sx={{ mt: 0.5, ml: 0.5 }} />
              ) : (
                <Class sx={{ mt: 0.5, ml: 0.5 }} />
              )}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '20px',
                  }}
                >
                  Cursilho
                </Typography>
                <Typography>
                  Esse evento separa as inscrições por grupos de participantes
                  cursilhistas e cursilheios. Gera quadrantes do evento
                  automaticamente.
                </Typography>
              </Box>{' '}
              <Radio
                sx={{ p: 0.5 }}
                value={'CURSILHO'}
                checked={field.value === 'CURSILHO'}
                onChange={() => field.onChange('CURSILHO')}
                inputProps={{ 'aria-label': 'CURSILHO' }}
              />
            </Box>
          </Grid>{' '}
          <Grid item xs={12} md={6}>
            <Box
              onClick={() => field.onChange('RETIRO')}
              sx={{
                border:
                  field.value === 'RETIRO'
                    ? `1px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  field.value === 'RETIRO'
                    ? alpha(theme.palette.primary.main, 0.08)
                    : alpha(theme.palette.text.primary, 0.02),
                padding: '16px',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  ...(field.value !== 'RETIRO'
                    ? {
                        backgroundColor: alpha(
                          theme.palette.text.primary,
                          0.08
                        ),
                      }
                    : {}),
                },
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              {field.value === 'RETIRO' ? (
                <Backpack sx={{ mt: 0.5, ml: 0.5 }} />
              ) : (
                <Backpack sx={{ mt: 0.5, ml: 0.5 }} />
              )}
              <Box>
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '20px',
                  }}
                >
                  Retiro
                </Typography>
                <Typography>
                  Esse evento conta com inscrições completas e por diárias,
                  separando também os valores por faixa etária de idade.
                </Typography>
              </Box>
              <Radio
                sx={{ p: 0.5 }}
                value={'RETIRO'}
                checked={field.value === 'RETIRO'}
                onChange={() => field.onChange('RETIRO')}
                inputProps={{ 'aria-label': 'RETIRO' }}
              />
            </Box>
          </Grid>
          {errors.eventType ? (
            <Grid item xs={12}>
              <Typography color="error" variant="caption">
                {errors.eventType.message as string}
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      )}
    />
  );
}

export { SelectCategoryEvent };
