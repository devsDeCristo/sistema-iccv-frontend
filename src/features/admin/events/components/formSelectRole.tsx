import {
  alpha,
  Box,
  Checkbox,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { GroupRole, SelectRoleFormType } from '../types';
interface FormSelectRoleProps {
  groupRoles: GroupRole[];
}
function FormSelectRole({ groupRoles }: FormSelectRoleProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<SelectRoleFormType>();
  const theme = useTheme();
  if (!groupRoles) return <></>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={'18px'}>
          Seleciona as regras que você se encaixa em cada grupo
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          {groupRoles.map((groupRole) => {
            return (
              <Grid item xs={12} md={12}>
                <Typography variant="h6" fontSize={'18px'}>
                  Grupo: {groupRole.name}
                </Typography>
                <Controller
                  name="roleId"
                  control={control}
                  rules={{ required: 'Selecione o tipo de evento' }}
                  render={({ field }) => (
                    <Grid item xs={12} md={12}>
                      {groupRole?.roles?.map((role) => {
                        if (role.id === undefined) return null;
                        const isSelected = field.value === role.id;
                        return (
                          <Box
                            key={role.id}
                            onClick={() => field.onChange(role.id)}
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
                              inputProps={{ 'aria-label': role.description }}
                            />
                            {errors.roleId && (
                              <Typography
                                color="error"
                                variant="body2"
                                sx={{ ml: 2 }}
                              >
                                {errors.roleId.message}
                              </Typography>
                            )}{' '}
                            <Box sx={{ ml: 2 }}>
                              <Typography variant="h6">
                                {role.description}
                              </Typography>
                              <Typography variant="body2">
                                Preço: {role.price}
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
          })}{' '}
        </Grid>
      </Grid>
    </Grid>
  );
}

export { FormSelectRole };
