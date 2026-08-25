import {
  Alert,
  Backdrop,
  Box,
  Button,
  Checkbox,
  Chip,
  Fade,
  Grid,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { ResponsiveAutocomplete } from '../../../../components/responsiveAutocomplete';
import { usePostCreateTeam } from '../api/postTeam';
import { usePutTeam } from '../api/putTeam';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { Team } from '../types';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_TEAMS } from '../constants';
import { User } from '../../../../types/user';
import { useGetUsers } from '../api/getUsers';

interface ModalTeamProps {
  open: boolean;
  handleClose: () => void;
  team?: Team | null;
  eventId: string;
}

interface UserOption {
  value: string;
  label: string;
  groupName: string;
}

const emptyForm = {
  name: '',
  capacity: '',
  note: '',
  usersId: [] as UserOption[],
  usersLeadersId: [] as UserOption[],
};

function ModalTeam({ open, handleClose, team, eventId }: ModalTeamProps) {
  const theme = useTheme();
  const styles = {
    title: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: theme.palette.text.primary,
    },
    subTitle: {
      fontWeight: 400,
      fontSize: '1rem',
      color: theme.palette.text.primary,
    },
    overflow: {
      overflow: 'auto',
      flex: 1,
      minHeight: 0,
      maxHeight: { xs: 'none', sm: '75vh' },
      mb: 2,
    },
    container: {
      // no celular o modal toma a tela inteira; no desktop segue centralizado
      position: 'absolute' as 'absolute',
      top: { xs: 0, sm: '50%' },
      left: { xs: 0, sm: '50%' },
      transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
      width: { xs: '100%', sm: 600 },
      height: { xs: '100%', sm: 'auto' },
      maxHeight: { xs: '100%', sm: '90vh' },
      display: 'flex',
      flexDirection: 'column',
      color: '#000',
      backgroundColor: theme.palette.background.paperSecondary,
      boxShadow: 14,
      p: { xs: 2, md: 3 },
    },
    // o corpo rola e o botão de salvar fica sempre à vista
    form: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    },
  };
  const {
    control,
    reset,
    handleSubmit,
    watch,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, mode: 'onChange' });

  const { mutate: putTeam, isLoading: isUpdating } = usePutTeam({
    onSuccess: () => {
      reset(emptyForm);
      handleClose();
      queryClient.invalidateQueries(GET_TEAMS);
    },
  });
  const { mutate: postCreateTeam, isLoading: isCreating } = usePostCreateTeam({
    onSuccess: () => {
      reset(emptyForm);
      handleClose();
      queryClient.invalidateQueries(GET_TEAMS);
    },
  });
  const isSaving = isCreating || isUpdating;

  const { data: userData, isLoading: isLoadingUsers } = useGetUsers(
    { eventId: eventId || '' },
    {
      enabled: !!eventId,
    }
  );

  const users = userData as User[];
  function mapUsersToOptions(users: User[]): UserOption[] {
    return users
      .flatMap((user) =>
        user?.groupsRegistration?.map((group) => ({
          value: user.id,
          label: user.fullName,
          groupName: group.name,
        }))
      )
      .filter((option): option is UserOption => !!option?.groupName)
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }

  const options = mapUsersToOptions(users || []);

  const capacity = Number(watch('capacity') || 0);
  const leaders = watch('usersLeadersId') || [];
  const members = watch('usersId') || [];
  const totalSelecionados = leaders.length + members.length;
  const vagasRestantes = capacity - totalSelecionados;
  const semCapacidade = capacity <= 0;
  const equipeCheia = !semCapacidade && vagasRestantes <= 0;

  const onSubimitTeam = (data: any) => {
    const transoformData = {
      ...data,
      usersId: (data.usersId || []).map((user: any) => user.value),
      usersLeadersId: (data.usersLeadersId || []).map(
        (user: any) => user.value
      ),
      capacity: Number(data.capacity),
    };

    if (team) {
      putTeam({
        eventId,
        teamId: team.id,
        data: transoformData,
      });
      return;
    }

    postCreateTeam({
      eventId,
      data: transoformData,
    });
  };

  const onInvalid = () => {
    toast.error(
      'Não foi possível salvar. Verifique os campos destacados em vermelho.'
    );
  };

  const Title = ({ title, hint }: { title: string; hint?: string }) => {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography id="transition-modal-title" sx={styles.subTitle}>
          {title}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Stack>
    );
  };

  useEffect(() => {
    if (!open) return;

    if (team) {
      reset({
        capacity: String(team.capacity || ''),
        note: team.note || '',
        name: team.name || '',
        usersId: team.users
          .filter((user) => user.roleTeam === 'MEMBER')
          .map((user) => ({
            value: user.id,
            label: user.fullName,
            groupName: '',
          })),
        usersLeadersId: team.users
          .filter((user) => user.roleTeam === 'LEADER')
          .map((user) => ({
            value: user.id,
            label: user.fullName,
            groupName: '',
          })),
      });
      return;
    }

    reset(emptyForm);
  }, [team, open]);

  const listaDeErros = Object.values(errors)
    .map((error: any) => error?.message)
    .filter(Boolean) as string[];

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      sx={{
        '& .MuiBox-root': { borderRadius: { xs: 0, sm: 1 } },
      }}
    >
      <Fade in={open}>
        <Box sx={styles.container}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography sx={styles.title}>
              {team ? 'Editar ' : 'Adicionar '} Equipe
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubimitTeam, onInvalid)}
            noValidate
            sx={styles.form}
          >
            <Box sx={styles.overflow}>
              {listaDeErros.length > 0 && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Corrija os itens abaixo para salvar:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {listaDeErros.map((mensagem) => (
                      <li key={mensagem}>
                        <Typography variant="body2">{mensagem}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={7}>
                  <Controller
                    control={control}
                    name="name"
                    rules={{
                      required: 'Informe o nome da equipe',
                    }}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <>
                        <Title title="Nome" />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="Informe o nome da Equipe"
                          value={value}
                          onChange={onChange}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    control={control}
                    name="capacity"
                    rules={{
                      required: 'Informe a capacidade da equipe',
                      validate: (value) => {
                        const capacidade = Number(value);
                        if (!capacidade || capacidade < 1) {
                          return 'A capacidade deve ser de no mínimo 1 pessoa';
                        }
                        const selecionados =
                          (getValues('usersId') || []).length +
                          (getValues('usersLeadersId') || []).length;
                        if (capacidade < selecionados) {
                          return `A capacidade (${capacidade}) é menor que as ${selecionados} pessoas já selecionadas. Remova pessoas ou aumente a capacidade.`;
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <>
                        <Title title="Capacidade" />
                        <TextField
                          fullWidth
                          inputProps={{ min: 1 }}
                          type="number"
                          variant="outlined"
                          size="small"
                          placeholder="Informe a capacidade"
                          value={value}
                          onChange={onChange}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            (!semCapacidade
                              ? `${totalSelecionados} de ${capacity} vagas preenchidas`
                              : 'Defina a capacidade para liberar a seleção')
                          }
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Anotações" />
                        <TextField
                          multiline
                          rows={2}
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="Adicione uma anotação"
                          value={value}
                          onChange={onChange}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="usersLeadersId"
                    rules={{
                      validate: (value) =>
                        (value || []).length > 0 ||
                        'Selecione ao menos um líder para a equipe',
                    }}
                    render={({ field: { onChange, value }, fieldState }) => {
                      const selecionados: UserOption[] = value || [];
                      const idsMembros = members.map(
                        (member: UserOption) => member.value
                      );

                      return (
                        <>
                          <Title
                            title="Líderes *"
                            hint={
                              semCapacidade
                                ? undefined
                                : `${selecionados.length} selecionado(s)`
                            }
                          />
                          <ResponsiveAutocomplete
                            mobileTitle="Líderes"
                            mobileNotice={
                              equipeCheia
                                ? `Capacidade máxima atingida: ${totalSelecionados} de ${capacity} vagas preenchidas. Aumente a capacidade da equipe para adicionar mais pessoas.`
                                : undefined
                            }
                            multiple
                            size="small"
                            disableCloseOnSelect
                            loading={isLoadingUsers}
                            disabled={semCapacidade}
                            options={options || []}
                            groupBy={(option) => option.groupName}
                            isOptionEqualToValue={(option, value) =>
                              option.value == value.value
                            }
                            getOptionLabel={(option) => option.label}
                            getOptionDisabled={(option) => {
                              const jaSelecionado = selecionados.some(
                                (item) => item.value === option.value
                              );
                              if (jaSelecionado) return false;
                              if (idsMembros.includes(option.value))
                                return true;
                              return equipeCheia;
                            }}
                            noOptionsText="Nenhuma pessoa inscrita encontrada"
                            ListboxProps={{
                              style: {
                                maxHeight: 200, // altura máxima
                                overflowY: 'auto', // scroll vertical
                              },
                            }}
                            renderOption={(props, option, { selected }) => {
                              const { key, ...optionProps } = props;
                              const jaEhParticipante =
                                !selected && idsMembros.includes(option.value);
                              return (
                                <li key={key} {...optionProps}>
                                  <Checkbox
                                    icon={
                                      <CheckBoxOutlineBlank fontSize="small" />
                                    }
                                    checkedIcon={<CheckBox fontSize="small" />}
                                    style={{
                                      marginLeft: '-10px',
                                      marginRight: '5px',
                                    }}
                                    checked={selected}
                                  />
                                  {option.label}
                                  {jaEhParticipante && (
                                    <Chip
                                      label="já é participante"
                                      size="small"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </li>
                              );
                            }}
                            onChange={(_, newValue) => {
                              if (newValue.length < selecionados.length) {
                                onChange(newValue);
                                trigger('capacity');
                                return;
                              }
                              if (newValue.length + members.length > capacity) {
                                toast.warning(
                                  `Capacidade máxima de ${capacity} pessoas atingida. Aumente a capacidade para adicionar mais alguém.`
                                );
                                return;
                              }
                              onChange(newValue);
                              trigger('capacity');
                            }}
                            value={selecionados}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={
                                  semCapacidade
                                    ? 'Informe a capacidade primeiro'
                                    : 'Selecione os líderes'
                                }
                                error={!!fieldState.error}
                                helperText={
                                  fieldState.error?.message ||
                                  (semCapacidade
                                    ? 'Informe a capacidade da equipe para liberar a seleção'
                                    : equipeCheia
                                    ? `Equipe cheia (${totalSelecionados}/${capacity}). Aumente a capacidade para adicionar mais pessoas.`
                                    : `${vagasRestantes} vaga(s) disponível(is)`)
                                }
                              />
                            )}
                          />
                        </>
                      );
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="usersId"
                    rules={{
                      validate: (value) =>
                        (value || []).length > 0 ||
                        'Selecione ao menos um participante para a equipe',
                    }}
                    render={({ field: { onChange, value }, fieldState }) => {
                      const selecionados: UserOption[] = value || [];
                      const idsLideres = leaders.map(
                        (leader: UserOption) => leader.value
                      );

                      return (
                        <>
                          <Title
                            title="Participantes *"
                            hint={
                              semCapacidade
                                ? undefined
                                : `${selecionados.length} selecionado(s)`
                            }
                          />
                          <ResponsiveAutocomplete
                            mobileTitle="Participantes"
                            mobileNotice={
                              equipeCheia
                                ? `Capacidade máxima atingida: ${totalSelecionados} de ${capacity} vagas preenchidas. Aumente a capacidade da equipe para adicionar mais pessoas.`
                                : undefined
                            }
                            multiple
                            size="small"
                            disableCloseOnSelect
                            loading={isLoadingUsers}
                            disabled={semCapacidade}
                            options={options || []}
                            groupBy={(option) => option.groupName}
                            isOptionEqualToValue={(option, value) =>
                              option.value == value.value
                            }
                            getOptionLabel={(option) => option.label}
                            getOptionDisabled={(option) => {
                              const jaSelecionado = selecionados.some(
                                (item) => item.value === option.value
                              );
                              if (jaSelecionado) return false;
                              if (idsLideres.includes(option.value))
                                return true;
                              return equipeCheia;
                            }}
                            noOptionsText="Nenhuma pessoa inscrita encontrada"
                            ListboxProps={{
                              style: {
                                maxHeight: 200, // altura máxima
                                overflowY: 'auto', // scroll vertical
                              },
                            }}
                            renderOption={(props, option, { selected }) => {
                              const { key, ...optionProps } = props;
                              const jaEhLider =
                                !selected && idsLideres.includes(option.value);
                              return (
                                <li key={key} {...optionProps}>
                                  <Checkbox
                                    icon={
                                      <CheckBoxOutlineBlank fontSize="small" />
                                    }
                                    checkedIcon={<CheckBox fontSize="small" />}
                                    style={{
                                      marginLeft: '-10px',
                                      marginRight: '5px',
                                    }}
                                    checked={selected}
                                  />
                                  {option.label}
                                  {jaEhLider && (
                                    <Chip
                                      label="já é líder"
                                      size="small"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </li>
                              );
                            }}
                            onChange={(_, newValue) => {
                              if (newValue.length < selecionados.length) {
                                onChange(newValue);
                                trigger('capacity');
                                return;
                              }
                              if (newValue.length + leaders.length > capacity) {
                                toast.warning(
                                  `Capacidade máxima de ${capacity} pessoas atingida. Aumente a capacidade para adicionar mais alguém.`
                                );
                                return;
                              }
                              onChange(newValue);
                              trigger('capacity');
                            }}
                            value={selecionados}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={
                                  semCapacidade
                                    ? 'Informe a capacidade primeiro'
                                    : 'Selecione os participantes'
                                }
                                error={!!fieldState.error}
                                helperText={
                                  fieldState.error?.message ||
                                  (semCapacidade
                                    ? 'Informe a capacidade da equipe para liberar a seleção'
                                    : equipeCheia
                                    ? `Equipe cheia (${totalSelecionados}/${capacity}). Aumente a capacidade para adicionar mais pessoas.`
                                    : `${vagasRestantes} vaga(s) disponível(is)`)
                                }
                              />
                            )}
                          />
                        </>
                      );
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalTeam };
