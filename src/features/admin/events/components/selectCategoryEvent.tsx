import { alpha, Box, Grid, Radio, Typography, useTheme } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { CategoryEventFormType } from '../types';
import { Backpack, Class } from '@mui/icons-material';
import { useEffect } from 'react';
interface SelectCategoryEventProps {
  selectEventType: (eventType: 'CURSILHO' | 'RETIRO') => void;
}
function SelectCategoryEvent({ selectEventType }: SelectCategoryEventProps) {
  const {
    control,
    setValue,
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
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6">
          Selecione qual tipo de evento deseja criar
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          onClick={() => {
            setValue('eventType', 'CURSILHO');
          }}
          sx={{
            border:
              eventSelected === 'CURSILHO'
                ? `1px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
            backgroundColor:
              eventSelected === 'CURSILHO'
                ? alpha(theme.palette.primary.main, 0.08)
                : alpha(theme.palette.text.primary, 0.02),
            padding: '16px',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              ...(eventSelected !== 'CURSILHO'
                ? { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
                : {}),
            },
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {eventSelected === 'CURSILHO' ? (
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
            value={eventSelected === 'CURSILHO'}
            checked={eventSelected === 'CURSILHO'}
            inputProps={{ 'aria-label': 'CURSILHO' }}
          />
        </Box>
      </Grid>{' '}
      <Grid item xs={12} md={6}>
        <Box
          onClick={() => {
            setValue('eventType', 'RETIRO');
          }}
          sx={{
            border:
              eventSelected === 'RETIRO'
                ? `1px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
            backgroundColor:
              eventSelected === 'RETIRO'
                ? alpha(theme.palette.primary.main, 0.08)
                : alpha(theme.palette.text.primary, 0.02),
            padding: '16px',
            borderRadius: 2,
            cursor: 'pointer',
            '&:hover': {
              ...(eventSelected !== 'RETIRO'
                ? { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
                : {}),
            },
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {eventSelected === 'RETIRO' ? (
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
            value={eventSelected === 'RETIRO'}
            checked={eventSelected === 'RETIRO'}
            inputProps={{ 'aria-label': 'RETIRO' }}
          />
        </Box>
      </Grid>
    </Grid>
  );
}

export { SelectCategoryEvent };
