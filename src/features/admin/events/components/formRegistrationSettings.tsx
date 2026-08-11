import {
  Alert,
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
import { useState } from 'react';
import {
  Add,
  Close,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { RegistrationSettingsFormType } from '../types';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import { sanitizePrice, sanitizeInteger } from '../../../../utils';

function FormRegistrationSettings() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<RegistrationSettingsFormType>();
  const theme = useTheme();
  const groupRoles = useWatch({
    control,
    name: 'groupRoles',
  });
  const [groupsExpanded, setGroupsExpanded] = useState<any>(
    groupRoles?.map((_v, index) => ({
      [index]: true,
    }))
  );

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
        const updatedGroupRoles = [...groupRoles];
        updatedGroupRoles.splice(index, 1);
        setValue('groupRoles', updatedGroupRoles);
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
            const updatedGroupRoles = [...groupRoles] as any;
            updatedGroupRoles.push({
              name: '',
              capacity: null,
              link: '',
              roles: [],
            });

            setValue('groupRoles', updatedGroupRoles);
          }}
        >
          Adicionar novo grupo
        </Button>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          {groupRoles.map(({ roles }, index) => {
       
            const disabledGroup = roles.some(({ registered, waitlisted }) => {
              return (registered && registered > 0) || (waitlisted && waitlisted > 0);
            });

            const expanded =
              groupsExpanded?.find(
                (group: any) => Object.keys(group)[0] === index.toString()
              )?.[index] ?? true;
            return (
              <Grid item xs={12} md={12}>
                <Box
                  key={index + 'groupRole'}
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
                    sx={{ mb: disabledGroup ? 0 : 2 }}
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
                          display: disabledGroup ? 'none' : 'flex',
                        }}
                        onClick={() => handleRemoveGroupRole(index)}
                      >
                        <Close />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  {disabledGroup && (
                    <Alert
                      severity="warning"
                      variant="outlined"
                      sx={{
                        mb: 2,
                        background: alpha(theme.palette.warning.main, 0.1),
                      }}
                    >
                      {' '}
                      Esse grupo possui inscrições já realizadas, portanto não
                      pode ser removido.
                    </Alert>
                    // <Typography variant="body2" sx={{ mb: 2 }} color="warning">
                    //   Esse grupo possui inscrições já realizadas, portanto não
                    //   pode ser removido.
                    // </Typography>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Grid item xs={12} md={10}>
                      <Controller
                        control={control}
                        name={`groupRoles.${index}.name`}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            size="small"
                            value={value}
                            placeholder="Ex: Meia entrada"
                            // disabled={disabled}
                            onChange={onChange}
                            // onChange={(event) => onChange(onlyNumber(event.target.value))}
                            required
                            label="Nome"
                            errorMessage={
                              errors.groupRoles?.[index]?.name?.message
                            }
                            error={Boolean(errors.groupRoles?.[index]?.name)}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Controller
                        control={control}
                        name={`groupRoles.${index}.capacity`}
                        render={({ field: { onChange, value } }) => (
                          <Input
                            type="text"
                            size="small"
                            placeholder="Ex: 200"
                           //isabled={disabledGroup}
                            value={value ?? ''}
                            onChange={(e) => {
                              const sanitized = sanitizeInteger(e.target.value);
                              if (!sanitized) {
                                onChange(null);
                                return;
                              }
                              onChange(Number(sanitized));
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const paste = (
                                e.clipboardData || (window as any).clipboardData
                              ).getData('text');
                              const sanitized = sanitizeInteger(paste);
                              if (!sanitized) {
                                onChange(null);
                                return;
                              }
                              onChange(Number(sanitized));
                            }}
                            onKeyDown={(e) => {
                              const allowed = [
                                'Backspace',
                                'Tab',
                                'ArrowLeft',
                                'ArrowRight',
                                'Delete',
                              ];
                              if (allowed.includes(e.key)) return;
                              if (!/^[0-9]$/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            required
                            label="Capacidade máxima de inscrições"
                            errorMessage={
                              errors.groupRoles?.[index]?.capacity?.message
                            }
                            error={Boolean(
                              errors.groupRoles?.[index]?.capacity
                            )}
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '\\d*',
                              min: 0,
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Box>
                  <Grid item xs={12} md={12} sx={{ mt: 2 }}>
                    <Controller
                      control={control}
                      name={`groupRoles.${index}.link`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          size="small"
                          sx={{ width: '100%' }}
                          value={value ?? ''}
                          onChange={onChange}
                          placeholder="Ex: https://chat.whatsapp.com/xxxxxxxx"
                          label="Link do grupo (opcional)"
                          errorMessage={
                            errors.groupRoles?.[index]?.link?.message ??
                            'Aparece apenas para quem está inscrito neste grupo'
                          }
                          error={Boolean(errors.groupRoles?.[index]?.link)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  {expanded ? (
                    <Divider sx={{ marginY: 2 }}>
                      <Chip
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          const updatedGroupRoles = [...groupsExpanded];
                          const groupIndex = updatedGroupRoles.findIndex(
                            (group: any) =>
                              Object.keys(group)[0] === index.toString()
                          );
                          if (groupIndex !== -1) {
                            updatedGroupRoles[groupIndex][index] = false;
                          } else {
                            updatedGroupRoles.push({ [index]: false });
                          }
                          setGroupsExpanded(updatedGroupRoles);
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
                          const updatedGroupRoles = [...groupsExpanded];
                          const groupIndex = updatedGroupRoles.findIndex(
                            (group: any) =>
                              Object.keys(group)[0] === index.toString()
                          );
                          if (groupIndex !== -1) {
                            updatedGroupRoles[groupIndex][index] = true;
                          } else {
                            updatedGroupRoles.push({ [index]: true });
                          }
                          setGroupsExpanded(updatedGroupRoles);
                        }}
                        icon={<KeyboardArrowDown />}
                        label="Mostrar Regras"
                      />
                    </Divider>
                    // </Divider>
                  )}{' '}
                  <Grid item xs={12} md={12}>
                    <Grid container spacing={2}>
                      {expanded &&
                        roles?.map(({ registered }, roleIndex) => (
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
                              <Grid item xs={12} md={10}>
                                <Controller
                                  control={control}
                                  name={`groupRoles.${index}.roles.${roleIndex}.description`}
                                  render={({ field: { onChange, value } }) => (
                                    <Input
                                      size="small"
                                      required
                                      placeholder="Ex: Idade entre 2 e 10 anos"
                                      // disabled={!!registered}
                                      sx={{ width: '100%' }}
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
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                    />
                                  )}
                                />{' '}
                              </Grid>
                              <Grid item xs={12} md={1.7}>
                                <Controller
                                  control={control}
                                  name={`groupRoles.${index}.roles.${roleIndex}.price`}
                                  render={({ field: { onChange, value } }) => (
                                    <Input
                                      size="small"
                                      required
                                      // disabled={!!registered}
                                      value={value ?? ''}
                                      placeholder="Ex: 100"
                                      type="number"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (!val) {
                                          onChange(null);
                                          return;
                                        }
                                        onChange(sanitizePrice(val));
                                      }}
                                      onKeyDown={(e) => {
                                        // bloquear caracteres não desejados no input de preço
                                        const blocked = ['e', 'E', '+', '-'];
                                        if (blocked.includes(e.key)) {
                                          e.preventDefault();
                                        }
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
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={12} md={0.2}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Tooltip title={'Remover Regra'}>
                                    <IconButton
                                      disabled={!!registered}
                                      onClick={() => {
                                        const updatedGroupRoles = [
                                          ...groupRoles,
                                        ];
                                        updatedGroupRoles[index].roles.splice(
                                          roleIndex,
                                          1
                                        );

                                        setValue(
                                          'groupRoles',
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
                            const updatedGroupRoles = [...groupRoles] as any;
                            updatedGroupRoles[index].roles?.push({
                              price: null,
                              description: '',
                            });
                            setValue('groupRoles', updatedGroupRoles);
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

                            '&:hover': {
                              backgroundColor: alpha(
                                theme.palette.text.primary,
                                0.05
                              ),
                            },
                            border: 'none',
                            // ...(!!registered && {
                            //   pointerEvents: 'none',
                            //   opacity: 0.6,
                            // }),
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
