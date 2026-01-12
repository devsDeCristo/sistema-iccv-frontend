import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
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
import { useGetEvents } from '../api/getEvents';
import { useEffect } from 'react';
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
      maxHeight: '75vh',
      mb: 2,
    },
    container: {
      position: 'absolute' as 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90%', sm: 600 },
      color: '#000',
      backgroundColor: theme.palette.background.paperSecondary,
      boxShadow: 14,
      p: { xs: 2, md: 3 },
    },
  };
  const { control, reset, handleSubmit, watch } = useForm();
  const { mutate: putTeam } = usePutTeam({
    onSuccess: () => {
      reset();
      handleClose();
      queryClient.invalidateQueries(GET_TEAMS);
    },
  });
  const { mutate: postCreateTeam } = usePostCreateTeam({
    onSuccess: () => {
      reset();
      handleClose();
      queryClient.invalidateQueries(GET_TEAMS);
    },
  });
  const { data: userData } = useGetUsers(
    { eventId: eventId || '' },
    {
      enabled: !!eventId,
    }
  );

  const users = userData as User[];
  function mapUsersToOptions(users: User[]) {
    return users
      .flatMap((user) =>
        user?.groupsRegistration?.map((group) => ({
          value: user.id,
          label: user.fullName,
          groupName: group.name,
        }))
      )
      .sort((a, b) => a?.groupName.localeCompare(b?.groupName));
  }

  const options = mapUsersToOptions(users || []);

  const onSubimitTeam = (data: any) => {
    const transoformData = {
      ...data,
      usersId: data.usersId.map((user: any) => user.value),
      usersLeadersId: data.usersLeadersId.map((user: any) => user.value),
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

  const Title = ({ title }: { title: string }) => {
    return (
      <Typography id="transition-modal-title" sx={styles.subTitle}>
        {title}
      </Typography>
    );
  };

  useEffect(() => {
    if (team) {
      reset({
        capacity: team.capacity || 0,
        note: team.note,
        name: team.name,
        usersId: team.users
          .filter((user) => user.roleTeam === 'MEMBER')
          .map((user) => ({
            value: user.id,
            label: user.fullName,
          })),
        usersLeadersId: team.users
          .filter((user) => user.roleTeam === 'LEADER')
          .map((user) => ({
            value: user.id,
            label: user.fullName,
          })),
      });
    }
  }, [team]);

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
        '& .MuiBox-root': { borderRadius: 1 },
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
          <form onSubmit={handleSubmit(onSubimitTeam)}>
            <Box sx={styles.overflow}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={7}>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Nome" />
                        <TextField
                          fullWidth
                          variant="outlined"
                          required
                          size="small"
                          placeholder="Informe o nome da Equipe"
                          value={value}
                          onChange={onChange}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    control={control}
                    name="capacity"
                    render={({ field: { onChange, value } }) => {
                      const participantes = Number(
                        (watch('usersId')?.length || 0) +
                          (watch('usersLeadersId')?.length || 0)
                      );

                      return (
                        <>
                          <Title title="Capacidade" />
                          <TextField
                            fullWidth
                            inputProps={{ min: participantes }}
                            type="number"
                            variant="outlined"
                            required
                            size="small"
                            placeholder="Informe a capacidade"
                            value={value}
                            onChange={onChange}
                          />
                        </>
                      );
                    }}
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
                    render={({ field: { onChange, value } }) => {
                      const capacity = Number(watch('capacity') || 0);
                      const participantes = Number(
                        watch('usersId')?.length || 0
                      );

                      return (
                        <>
                          <Title title="Lideres" />
                          <Autocomplete
                            multiple
                            size="small"
                            disableCloseOnSelect
                            id="tags-outlined"
                            options={options || []}
                            groupBy={(option) => option.groupName}
                            isOptionEqualToValue={(option, value) =>
                              option.value == value.value
                            }
                            getOptionLabel={(option) => option.label}
                            ListboxProps={{
                              style: {
                                maxHeight: 200, // altura máxima
                                overflowY: 'auto', // scroll vertical
                              },
                            }}
                            renderOption={(props, option, { selected }) => {
                              const { ...optionProps } = props;
                              const disabled =
                                value?.length + participantes >= capacity &&
                                !selected;
                              return (
                                <li key={option.label} {...optionProps}>
                                  <Checkbox
                                    icon={
                                      <CheckBoxOutlineBlank fontSize="small" />
                                    }
                                    checkedIcon={<CheckBox fontSize="small" />}
                                    style={{
                                      marginLeft: '-10px',
                                      marginRight: '5px',
                                    }}
                                    disabled={disabled}
                                    checked={selected}
                                  />
                                  {option.label}
                                </li>
                              );
                            }}
                            onChange={(_, newValue) => {
                              if (
                                newValue.length + participantes <=
                                (value?.length || 0)
                              ) {
                                // Removendo alguém → sempre deixa
                                onChange(newValue);
                              } else if (
                                newValue.length + participantes <=
                                capacity
                              ) {
                                // Adicionando → só deixa se não passar da capacidade
                                onChange(newValue);
                              }
                            }}
                            value={value || []}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Participantes"
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
                    render={({ field: { onChange, value } }) => {
                      const capacity = Number(watch('capacity') || 0);
                      const liders = Number(
                        watch('usersLeadersId')?.length || 0
                      );
                      return (
                        <>
                          <Title title="Participantes" />
                          <Autocomplete
                            multiple
                            size="small"
                            disableCloseOnSelect
                            id="tags-outlined"
                            options={options || []}
                            groupBy={(option) => option.groupName}
                            isOptionEqualToValue={(option, value) =>
                              option.value == value.value
                            }
                            getOptionLabel={(option) => option.label}
                            ListboxProps={{
                              style: {
                                maxHeight: 200, // altura máxima
                                overflowY: 'auto', // scroll vertical
                              },
                            }}
                            renderOption={(props, option, { selected }) => {
                              const { ...optionProps } = props;
                              const disabled =
                                value?.length + liders >= capacity && !selected;
                              return (
                                <li key={option.label} {...optionProps}>
                                  <Checkbox
                                    disabled={disabled}
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
                                </li>
                              );
                            }}
                            onChange={(_, newValue) => {
                              if (
                                newValue.length + liders <=
                                (value?.length || 0)
                              ) {
                                // Removendo alguém → sempre deixa
                                onChange(newValue);
                              } else if (newValue.length + liders <= capacity) {
                                // Adicionando → só deixa se não passar da capacidade
                                onChange(newValue);
                              }
                            }}
                            value={value || []}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Participantes"
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
            <Button type="submit" variant="contained" fullWidth>
              Salvar
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalTeam };
