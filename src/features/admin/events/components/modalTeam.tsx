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
import { useEffect} from 'react';
import { usePostCreateTeam } from '../api/postTeam';
import { usePutTeam } from '../api/putTeam';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { Team } from '../types';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_TEAMS } from '../constants';

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
  const { control, reset, handleSubmit } = useForm();
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
  const { data: eventData } = useGetEvents(
    { eventId: eventId },
    {
      enabled: !!eventId,
    }
  );
  const options =
    !Array.isArray(eventData) &&
    eventData?.users?.map((user: any) => ({
      value: user.id,
      label: user.fullName,
    }));

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
        capacity: team.capacity||0,
        note: team.note,
        name: team.name,
        usersId: team.users.filter((user) => user.roleTeam === 'MEMBER').map((user) => ({
          value: user.id,
          label: user.fullName,
        })),
        usersLeadersId: team.users.filter((user) => user.roleTeam === 'LEADER').map((user) => ({
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
            <Box  sx={styles.overflow}>
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
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Capacidade" />
                        <TextField
                          fullWidth
                          type="number"
                          variant="outlined"
                          required
                          size="small"
                          placeholder="Informe a capacidade"
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
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Lideres" />
                        <Autocomplete
                          multiple
                          size="small"
                          disableCloseOnSelect
                          id="tags-outlined"
                          options={options || []}
                          isOptionEqualToValue={(option, value) =>
                            option.label == value.label
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
                                  checked={selected}
                                />
                                {option.label}
                              </li>
                            );
                          }}
                          onChange={(_, newValue) => {
                            onChange(newValue);
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
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="usersId"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Participantes" />
                        <Autocomplete
                          multiple
                          size="small"
                          disableCloseOnSelect
                          id="tags-outlined"
                          options={options || []}
                          isOptionEqualToValue={(option, value) =>
                            option.label == value.label
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
                                  checked={selected}
                                />
                                {option.label}
                              </li>
                            );
                          }}
                          onChange={(_, newValue) => {
                            onChange(newValue);
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
                    )}
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
