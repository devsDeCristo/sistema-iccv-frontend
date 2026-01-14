import {
  alpha,
  Box,
  Checkbox,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { EventDetails, PayLoadGroup, SelectGroupRoleFormType } from '../types';
interface FormSelectGroupRoleProps {
  event: EventDetails;
  groups: PayLoadGroup;
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
            fontSize: '18px',
            color: theme.palette.text.secondary,
          }}
        >
          Selecione qual(is) ingresso(s) deseja comprar:
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          <Controller
            name="groupRoleId"
            control={control}
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
                  const registeredInGroup =
                    groups?.present?.some((g) => g.id === group.id) || false;
                  const registeredInGroupWaitList =
                    groups?.waitlist?.some((g) => g.id === group.id) || false;
                  const disabled =
                    registeredInGroup || registeredInGroupWaitList;
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
                        padding: {xs:"25px 20px", md:"15px 15px"},
                        mt: 2,
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
                      <Box
                        sx={{
                          ml: 2,
                          opacity: disabled ? 0.6 : 1,
                        }}
                      >
                        <Typography variant="h6">{group.name}</Typography>
                        <Typography variant="body2">
                          Vagas Disponíveis: {(capacity || 0) - subscribedCount}{' '}
                          de {capacity || 0}
                        </Typography>
                      </Box>
                      {(registeredInGroup || registeredInGroupWaitList) && (
                        <Box
                          sx={{
                            fontSize: '15px',
                            flexGrow: 1,
                            position: 'absolute',
                            backgroundColor: theme.palette.background.paper,
                            padding: '0.5px 5px',
                            right: 10,
                            top: 0,
                            color: registeredInGroup
                              ? theme.palette.success.main
                              : theme.palette.warning.main,
                            fontWeight: 500,
                           
                          }}
                        >
                          {`Inscrição Realizada! ${
                            registeredInGroupWaitList ? '(Lista de Espera)' : ''
                          }`}
                        </Box>
                      )}
                      {!registeredInGroup &&
                        !registeredInGroupWaitList &&
                        subscribedCount >= (capacity || 0) && (
                          <Box
                            sx={{
                              fontSize: '17px',
                              flexGrow: 1,
                              position: 'absolute',
                              right: 10,
                              top: 10,
                              color: theme.palette.warning.main,
                              fontWeight: 500,
                            }}
                          >
                            {'Somente Lista de Espera!'}
                          </Box>
                        )}
                    </Box>
                  );
                })}
              </Grid>
            )}
          />
        </Grid>{' '}
        {errors.groupRoleId && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {errors.groupRoleId.message}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

export { FormSelectGroupRole };
