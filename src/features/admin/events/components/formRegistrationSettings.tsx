import {
  alpha,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Input } from '../../../../components/input';
import { useEffect, useState } from 'react';
import {
  Add,
  Close,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { GroupRole, RegistrationSettingsFormType } from '../types';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
// interface FormRegistrationSettingsProps {
//   eventTypeSelected?: EventType | undefined;
// }
interface GroupRoleExtended extends GroupRole {
  expanded: boolean;
}

function FormRegistrationSettings() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationSettingsFormType>();
  const theme = useTheme();
  const selectGroupRoles = useWatch({
    control,
    name: 'groupRoles',
  });

  const [selectGroupRolesExtended, setSelectGroupRolesExtended] = useState<
    GroupRoleExtended[]
  >(
    selectGroupRoles?.map((groupRole) => ({
      ...groupRole,
      expanded: true,
    }))
  );
  useEffect(() => {
    // Sync extended state with form state
    const syncedGroupRoles = selectGroupRolesExtended.map(
      ({ expanded, ...groupRole }) => groupRole
    );
    setValue('groupRoles', syncedGroupRoles);
  }, [selectGroupRolesExtended, setValue]);

  const handleRemoveGroupRole = (index: number) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação irá remover o grupo de inscrições.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedGroupRoles = [...selectGroupRolesExtended];
        updatedGroupRoles.splice(index, 1);
        setSelectGroupRolesExtended(updatedGroupRoles);
        // Swal.fire(
        //   'Removido!',
        //   'O grupo de inscrições foi removido.',
        //   'success'
        // );
      }
    });
  };
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
        <Button
          endIcon={<Add />}
          variant="contained"
          onClick={() => {
            const updatedGroupRoles = [...selectGroupRolesExtended];
            updatedGroupRoles.push({
              name: '',
              capacity: null,
              roles: [],
              expanded: true,
            });
            setSelectGroupRolesExtended(updatedGroupRoles);
          }}
        >
          Adicionar novo grupo
        </Button>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          {selectGroupRolesExtended.map(({ roles, expanded }, index) => {
            const disabled = roles.some(({ registered }) => {
              return registered && registered > 0;
            });
            return (
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
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    // width={'100%'}
                    sx={{ mb: disabled ? 0 : 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      sx={{
                        fontSize: 14,
                        // marginBottom: 2,
                        color: alpha(theme.palette.text.secondary, 1),
                      }}
                    >
                      GRUPO {index + 1}
                    </Typography>
                    {/* <Button
                      variant="text"
                      color="error"
                      endIcon={<Delete />}
                      sx={
                        {
                          // marginBottom: 2,
                        }
                      }
                      onClick={() => {
                        const updatedGroupRoles = [...selectGroupRolesExtended];
                        updatedGroupRoles.splice(index, 1);
                        setSelectGroupRolesExtended(updatedGroupRoles);
                      }}
                    >
                      Excluir Grupo
                    </Button> */}
                    <Tooltip title="Remover Grupo">
                      <IconButton
                        sx={{
                          '&:hover': { color: theme.palette.error.main },
                          display: disabled ? 'none' : 'flex',
                        }}
                        onClick={() => handleRemoveGroupRole(index)}
                      >
                        <Close />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  {disabled && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Esse grupo possui inscrições já realizadas, portanto não
                      pode ser editado ou removido.
                    </Typography>
                  )}
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
                            disabled={disabled}
                            onChange={onChange}
                            // onChange={(event) => onChange(onlyNumber(event.target.value))}
                            required
                            label="Nome"
                            errorMessage={
                              errors.groupRoles?.[index]?.name?.message
                            }
                            error={Boolean(errors.groupRoles?.[index]?.name)}
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
                            disabled={disabled}
                            value={value}
                            onChange={(e) => {
                              if (!e.target.value) {
                                onChange(null);
                                return;
                              }
                              onChange(Number(e.target.value));
                            }}
                            // onChange={(event) => onChange(onlyNumber(event.target.value))}
                            required
                            label="Capacidade máxima de inscrições"
                            errorMessage={
                              errors.groupRoles?.[index]?.capacity?.message
                            }
                            error={Boolean(
                              errors.groupRoles?.[index]?.capacity
                            )}
                            InputLabelProps={{
                              shrink: Boolean(value),
                            }}
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
                          const updatedGroupRoles = [
                            ...selectGroupRolesExtended,
                          ];
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
                          const updatedGroupRoles = [
                            ...selectGroupRolesExtended,
                          ];
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
                        roles?.map(({ description }, roleIndex) => (
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
                                      disabled={disabled}
                                      sx={{ width: '100%' }}
                                      placeholder={`Ex: ${description}`}
                                      value={value}
                                      onChange={onChange}
                                      label="Descrição"
                                      error={Boolean(
                                        errors.groupRoles?.[index]?.roles?.[
                                          roleIndex
                                        ]?.description
                                      )}
                                      errorMessage={
                                        errors.groupRoles?.[index]?.roles?.[
                                          roleIndex
                                        ]?.description?.message
                                      }
                                    />
                                  )}
                                />{' '}
                              </Grid>
                              <Grid item xs={12} md={1.7} key={index}>
                                <Controller
                                  control={control}
                                  name={`groupRoles.${index}.roles.${roleIndex}.price`}
                                  render={({ field: { onChange, value } }) => (
                                    <Input
                                      size="small"
                                      required
                                      disabled={disabled}
                                      value={value}
                                      type="number"
                                      onChange={(e) => {
                                        if (!e.target.value) {
                                          onChange(null);
                                          return;
                                        }
                                        onChange(Number(e.target.value));
                                      }}
                                      label="Preço (R$)"
                                      error={Boolean(
                                        errors.groupRoles?.[index]?.roles?.[
                                          roleIndex
                                        ]?.price
                                      )}
                                      errorMessage={
                                        errors.groupRoles?.[index]?.roles?.[
                                          roleIndex
                                        ]?.price?.message
                                      }
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12} md={0.2} key={index}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Tooltip title="Remover Regra">
                                    <IconButton
                                      disabled={disabled}
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
                                  </Tooltip>
                                </Box>
                              </Grid>
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                  {expanded ? (
                    <>
                      {roles.length > 0 && <Divider sx={{ marginY: 2 }} />}
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
                            updatedGroupRoles[index].roles?.push({
                              price: null,
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
                            // border: '1px solid',
                            width: 'fit-content',
                            backgroundColor: alpha(
                              theme.palette.text.primary,
                              0.1
                            ),
                            // borderColor: alpha(
                            //   theme.palette.text.secondary,
                            //   0.5
                            // ),
                            padding: '6px 12px',
                            // backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: alpha(
                                theme.palette.text.primary,
                                0.05
                              ),
                            },
                            border: 'none',
                            ...(disabled && {
                              pointerEvents: 'none',
                              opacity: 0.6,
                            }),
                          }}
                        >
                          <span
                            style={{ fontSize: '15px', fontWeight: 'bold' }}
                          >
                            Adicionar Regra
                          </span>
                          <Add />
                        </Box>
                        {/* <Button
                            disabled={disabled}
                            sx={{ marginLeft: 2 }}
                            endIcon={<Add />}
                            variant="outlined"
                            onClick={() => {
                              const updatedGroupRoles = [
                                ...selectGroupRolesExtended,
                              ];
                              updatedGroupRoles[index].roles?.push({
                                price: null,
                                description: '',
                              });
                              setSelectGroupRolesExtended(updatedGroupRoles);
                            }}
                          >
                            Adicionar Regra
                          </Button> */}
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ height: 20 }} />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
}

export { FormRegistrationSettings };
