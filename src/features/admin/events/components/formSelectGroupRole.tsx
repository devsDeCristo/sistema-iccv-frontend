import {
  alpha,
  Box,
  Checkbox,
  Grid,
  Paper,
  Radio,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { EventDetails, SelectGroupRoleFormType } from '../types';
interface FormSelectGroupRoleProps {
  event: EventDetails;
}
function FormSelectGroupRole({ event }: FormSelectGroupRoleProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<SelectGroupRoleFormType>();
  const theme = useTheme();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={'18px'}>
          Selecione qual(is) ingresso(s) deseja comprar:
        </Typography>
      </Grid>
      {/* <Typography variant="body1" gutterBottom>
            Selecione qual(is) ingresso(s) deseja comprar:
          </Typography> */}{' '}
      <Controller
        name="groupRoleId"
        control={control}
        rules={{ required: 'Selecione o tipo de evento' }}
        render={({ field }) => (
          <Grid item xs={12} md={12}>
            {event?.groupRoles?.map((role) => {
              if (role.id === undefined) return null;
              const isSelected = field?.value
                ? field.value.includes(role.id)
                : false;
              return (
                <Box
                  key={role.id}
                  onClick={() => {
                    if (isSelected) {
                      field.onChange(
                        field.value.filter((id) => id !== role.id)
                      );
                    } else {
                      if (field.value) {
                        field.onChange([...field.value, role.id]);
                      } else {
                        field.onChange([role.id]);
                      }
                    }
                  }}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    border: isSelected
                      ? `1px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.divider}`,
                    backgroundColor: isSelected
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.text.primary, 0.02),
                    cursor: 'pointer',
                    '&:hover': {
                      ...(!isSelected
                        ? {
                            backgroundColor: alpha(
                              theme.palette.text.primary,
                              0.08
                            ),
                          }
                        : {}),
                    },
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {' '}
                  <Checkbox
                    sx={{ p: 0.5 }}
                    value={role.id}
                    checked={isSelected}
                    onChange={() => field.onChange(role.id)}
                    inputProps={{ 'aria-label': role.name }}
                  />
                  {errors.groupRoleId && (
                    <Typography color="error" variant="body2" sx={{ ml: 2 }}>
                      {errors.groupRoleId.message}
                    </Typography>
                  )}{' '}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6">{role.name}</Typography>
                    <Typography variant="body2">
                      Capacidade: {role.capacity}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Grid>
        )}
      />
    </Grid>
  );
}

export { FormSelectGroupRole };
