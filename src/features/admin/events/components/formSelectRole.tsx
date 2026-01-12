import {
  alpha,
  Box,
  Checkbox,
  Divider,
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
        <Typography variant="h5" sx={{mt:-1, mb:2, fontSize:'18px', color: theme.palette.text.secondary}}>
          Seleciona as regras que você se encaixa em cada grupo
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          {groupRoles.map((groupRole) => {
            return (<>
              <Grid item xs={12} md={12} mb={2}>
                <Typography variant="h6" fontSize={'19px'}>
                 Grupo: <span style={{fontWeight: 'bold', color: theme.palette.text.secondary}}>{groupRole.name}</span>
                </Typography>
                <Divider sx={{  mb: 1 }} />
                <Controller
                  name="roleId"
                  control={control}
                  rules={{ required: 'Selecione ao menos uma opção' }}
                  render={({ field }) => (
                    <Grid item xs={12} md={12}>
                      {groupRole?.roles?.map((role) => {
                        if (role.id === undefined) return null;
                        const isSelected = field.value?.includes(role.id);
                        const handleToggle = () => {
                          const currentValues = field.value || [];
                          if (isSelected) {
                            field.onChange(currentValues.filter((id: string) => id !== role.id));
                          } else {
                             // Remove todas as roles do mesmo grupo antes de adicionar a nova
                            const otherGroupRoleIds = groupRole.roles
                              ?.map(r => r.id)
                              .filter((id): id is string => id !== undefined) || [];
                            
                            const valuesWithoutCurrentGroup = currentValues.filter(
                              (id: string) => !otherGroupRoleIds.includes(id)
                            );
                            
                            field.onChange([...valuesWithoutCurrentGroup, role.id]);
                          }
                        };
                        return (
                          <Box
                            key={role.id}
                            onClick={handleToggle}
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
                              checked={isSelected || false}
                              onChange={handleToggle}
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
              <Divider sx={{ mt: 3, mb: 3 }} />
              </>
            );
          })}{' '}
        </Grid>
      </Grid>
    </Grid>
  );
}

export { FormSelectRole };
