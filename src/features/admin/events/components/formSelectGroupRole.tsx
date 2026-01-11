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
import { EventDetails, Group, SelectGroupRoleFormType } from '../types';
interface FormSelectGroupRoleProps {
  event: EventDetails;
  groups: Group[];
}
function FormSelectGroupRole({ event, groups }: FormSelectGroupRoleProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<SelectGroupRoleFormType>();
  const theme = useTheme();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography
          variant="h5"
          sx={{
            mt: -1,
            mb: 2,
            fontSize: '18px',
            color: theme.palette.text.secondary,
          }}
        >
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
            {event?.groupRoles?.map((group) => {
             
              if (group.id === undefined) return null;
              const capacity = group.capacity;
              const subscribedCount =
                group.roles?.reduce(
                  (total, role) => total + (role.registered ?? 0),
                  0
                ) ?? 0;
              const registeredInGroup = groups?.some(g => g.id === group.id);
              const disabled = subscribedCount >= capacity || registeredInGroup;
              const isSelected = field?.value
                ? field.value.includes(group.id)
                : false;
              return (
                <Box
                  key={group.id}
                  onClick={() => {
                    if (disabled) return;
                    if (isSelected) {
                      field.onChange(
                        field.value.filter((id) => id !== group.id)
                      );
                    } else {
                      if (field.value) {
                        field.onChange([...field.value, group.id]);
                      } else {
                        field.onChange([group.id]);
                      }
                    }
                  }}
                  sx={{
                    position: 'relative',

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
                    sx={{
                      p: 0.5,
                      opacity: disabled ? 0.6 : 1,
                    }}
                    value={group.id}
                    disabled={disabled}
                    checked={isSelected}
                    onChange={() => field.onChange(group.id)}
                    inputProps={{ 'aria-label': group.name }}
                  />
                  {errors.groupRoleId && (
                    <Typography color="error" variant="body2" sx={{ ml: 2 }}>
                      {errors.groupRoleId.message}
                    </Typography>
                  )}{' '}
                  <Box
                    sx={{
                      ml: 2,
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    <Typography variant="h6">{group.name}</Typography>
                    <Typography variant="body2">
                      Vagas Disponíveis: {capacity - subscribedCount} de{' '}
                      {capacity}
                    </Typography>
                  </Box>
                  {subscribedCount >= capacity || registeredInGroup ? (
                    <Box
                      sx={{
                        fontSize: '18px',
                        flexGrow: 1,
                        position: 'absolute',
                        right: 10,
                        top: 10,
                        color: registeredInGroup ? theme.palette.success.main : theme.palette.error.main,
                        fontWeight: 500,
                      }}
                    >
                      {registeredInGroup ? "Inscrição Realizada!" : 'Esgotado!'}
                    </Box>
                  ) : null}
 
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
