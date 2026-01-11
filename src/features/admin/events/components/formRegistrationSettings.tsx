import {
  alpha,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { Input } from '../../../../components/input';
import { useState } from 'react';
import {
  Add,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { GroupRole, RegistrationSettingsFormType } from '../types';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
// interface FormRegistrationSettingsProps {
//   eventTypeSelected?: EventType | undefined;
// }
interface GroupRoleExtended extends GroupRole {
  expanded: boolean;
}

function FormRegistrationSettings() {
  const {
    control,
    // formState: { errors },
  } = useFormContext<RegistrationSettingsFormType>();

  const selectGroupRoles = useWatch({
    control,
    name: 'groupRoles',
  });

  const [selectGroupRolesExtended, setSelectGroupRolesExtended] = useState<
    GroupRoleExtended[]
  >(
    selectGroupRoles.map((groupRole) => ({
      ...groupRole,
      expanded: true,
    }))
  );
  const theme = useTheme();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" gutterBottom fontSize={'18px'}>
          Grupos de pessoas e regras de inscrição
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {
            'Defina os grupos e suas regras de inscrição para definir como os participantes poderão se inscrever no evento.\n'
          }
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {
            'Os grupos servem para separar os participantes em diferentes categorias, como "Cursilhistas" e "Cursilheiros" em um Cursilho, ou "Completo" e "Dárias" em um Retiro.'
          }
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {
            'As regras servem para definir diferentes valores de ingresso dentro de um grupo.'
          }
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          {selectGroupRolesExtended.map(({ roles, expanded }, index) => (
            <Grid item xs={12} md={12} key={index}>
              <Box
                key={index}
                sx={{
                  padding: 2,
                  gap: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.text.primary, 0.08),
                  backgroundColor: alpha(theme.palette.text.primary, 0.04),
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  fontWeight="bold"
                  sx={{
                    fontSize: 14,
                    marginBottom: 2,
                    color: alpha(theme.palette.text.secondary, 1),
                  }}
                >
                  GRUPO {index + 1}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <Grid item xs={12} md={10} key={index}>
                    <Controller
                      control={control}
                      name={`groupRoles.${index}.name`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          size="small"
                          value={value}
                          onChange={onChange}
                          // onChange={(event) => onChange(onlyNumber(event.target.value))}
                          required
                          label="Nome"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} key={index}>
                    <Controller
                      control={control}
                      name={`groupRoles.${index}.capacity`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          type="number"
                          size="small"
                          value={value}
                          onChange={onChange}
                          // onChange={(event) => onChange(onlyNumber(event.target.value))}
                          required
                          label="Capacidade máxima de inscrições"
                        />
                      )}
                    />
                  </Grid>
                </Box>
                {expanded ? (
                  <Divider sx={{ marginY: 2 }}>
                    <Chip
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        const updatedGroupRoles = [...selectGroupRolesExtended];
                        updatedGroupRoles[index].expanded = false;
                        setSelectGroupRolesExtended(updatedGroupRoles);
                      }}
                      icon={<KeyboardArrowUp />}
                      label="Recolher"
                    />
                  </Divider>
                ) : (
                  <Divider
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 'fit-content',
                      marginTop: 2,
                    }}
                  >
                    <Chip
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        const updatedGroupRoles = [...selectGroupRolesExtended];
                        updatedGroupRoles[index].expanded = true;
                        setSelectGroupRolesExtended(updatedGroupRoles);
                      }}
                      icon={<KeyboardArrowDown />}
                      label="Mostrar Regras"
                    />
                  </Divider>
                  // </Divider>
                )}{' '}
                <Grid item xs={12} md={12} key={index}>
                  <Grid container spacing={2}>
                    {expanded &&
                      roles.map(({ description }, roleIndex) => (
                        <Grid item xs={12} md={12}>
                          <Box
                            key={roleIndex}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              width: '100%',
                              flexDirection: { xs: 'column', md: 'row' },
                            }}
                          >
                            <Grid item xs={12} md={10} key={index}>
                              <Controller
                                control={control}
                                name={`groupRoles.${index}.roles.${roleIndex}.description`}
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    size="small"
                                    required
                                    sx={{ width: '100%' }}
                                    placeholder={`Ex: ${description}`}
                                    value={value}
                                    onChange={onChange}
                                    label="Descrição"
                                  />
                                )}
                              />{' '}
                            </Grid>
                            <Grid item xs={12} md={1} key={index}>
                              <Controller
                                control={control}
                                name={`groupRoles.${index}.roles.${roleIndex}.price`}
                                render={({ field: { onChange, value } }) => (
                                  <Input
                                    size="small"
                                    required
                                    value={value}
                                    onChange={onChange}
                                    label="Preço (R$)"
                                  />
                                )}
                              />
                            </Grid>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <IconButton
                                onClick={() => {
                                  const updatedGroupRoles = [
                                    ...selectGroupRolesExtended,
                                  ];
                                  updatedGroupRoles[index].roles.splice(
                                    roleIndex,
                                    1
                                  );
                                  setSelectGroupRolesExtended(
                                    updatedGroupRoles
                                  );
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                  </Grid>
                </Grid>
                {expanded && (
                  <>
                    <Divider sx={{ marginY: 2 }} />
                    <Box
                      sx={{
                        marginTop: 2,
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        onClick={() => {
                          const updatedGroupRoles = [
                            ...selectGroupRolesExtended,
                          ];
                          updatedGroupRoles[index].roles.push({
                            price: 0,
                            description: '',
                          });
                          setSelectGroupRolesExtended(updatedGroupRoles);
                        }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          cursor: 'pointer',
                          borderRadius: 1,
                          border: '1px solid',
                          width: 'fit-content',
                          backgroundColor: alpha(
                            theme.palette.text.primary,
                            0.1
                          ),
                          borderColor: alpha(theme.palette.text.secondary, 0.5),
                          padding: '6px 12px',
                          // backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: alpha(
                              theme.palette.text.primary,
                              0.05
                            ),
                          },
                        }}
                      >
                        <Add />
                        <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                          Adicionar Regra
                        </span>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export { FormRegistrationSettings };
