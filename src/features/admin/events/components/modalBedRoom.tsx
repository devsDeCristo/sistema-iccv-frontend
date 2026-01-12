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
import { usePostCreateBedroom } from '../api/postBedroom';
import { useEffect } from 'react';
import { usePutBedroom } from '../api/putBedroom';
import { useGetEvents } from '../api/getEvents';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { useGetUsers } from '../api/getUsers';
import { User } from '../../../../types/user';

interface ModalBedRoomProps {
  open: boolean;
  handleClose: () => void;
  eventId: string;
  bedRoom?: any;
}

function ModalBedRoom({
  open,
  handleClose,
  eventId = '',
  bedRoom,
}: ModalBedRoomProps) {
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
      p: 1,
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

  const { mutate: putBedroom } = usePutBedroom({
    onSuccess: () => {
      reset();
      handleClose();
    },
  });
  const { mutate: postCreateBedroom } = usePostCreateBedroom({
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const { data: userData } = useGetUsers(
    { eventId: eventId || '' },
    {
      enabled: !!eventId,
    }
  );

  const users = userData as User[];

  useEffect(() => {
    if (bedRoom) {
      reset({
        name: bedRoom.name,
        capacity: bedRoom.capacity,
        tags: bedRoom?.tag?.map((tag: any) => ({
          value: tag,
          label: tag,
        })),
        note: bedRoom.note,
        usersId: bedRoom?.users.map((user: any) => ({
          value: user.id,
          label: user.fullName,
        })),
      });
    }
  }, [bedRoom]);

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
  const onSubimitBedroom = (data: any) => {
    const { tags, capacity, ...rest } = data;
    const transoformData = {
      ...rest,
      tags:
        data.tags && data.tags.length > 0
          ? data.tags.map((tag: any) => tag.value)
          : [],
      capacity: Number(capacity),
      usersId:
        data.usersId && data.usersId.length > 0
          ? data.usersId.map((user: any) => user.value)
          : [],
    };

    if (bedRoom) {
      putBedroom({
        eventId,
        bedRoomId: bedRoom.id,
        data: transoformData,
      });
      return;
    }

    postCreateBedroom({
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
              {bedRoom ? 'Editar ' : 'Adicionar '} quarto
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
          <form onSubmit={handleSubmit(onSubimitBedroom)}>
            <Box sx={styles.overflow}>
              <Grid id="transition-modal-description" container spacing={1.5}>
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
                          placeholder="Informe o nome do quarto"
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
                        watch('usersId')?.length || 0
                      );
                      return (
                        <>
                          <Title title="Capacidade" />
                          <TextField
                            fullWidth
                            type="number"
                            inputProps={{ min: participantes }}
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
                    name="tags"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Tags" />

                        <Autocomplete
                          multiple
                          size="small"
                          disableCloseOnSelect
                          options={[
                            { value: 'Feminino', label: 'Feminino' },
                            { value: 'Masculino', label: 'Masculino' },
                            { value: 'Familia', label: 'Familia' },
                            { value: 'Outro', label: 'Outro' },
                          ]}
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
                            <TextField {...params} placeholder="Tags" />
                          )}
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
                    name="usersId"
                    render={({ field: { onChange, value } }) => {
                      const capacity = Number(watch('capacity') || 0);

                      return (
                        <>
                          <Title title="Participantes" />
                          <Autocomplete
                            multiple
                            size="small"
                            disableCloseOnSelect
                            groupBy={(option) => option.groupName}
                            id="tags-outlined"
                            options={options || []}
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
                                value?.length >= capacity && !selected;
                              return (
                                <li key={option.label} {...optionProps}>
                                  <Checkbox
                                    icon={
                                      <CheckBoxOutlineBlank fontSize="small" />
                                    }
                                    disabled={disabled}
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
                              if (newValue.length <= (value?.length || 0)) {
                                // Removendo alguém → sempre deixa
                                onChange(newValue);
                              } else if (newValue.length <= capacity) {
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
            </Button>{' '}
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalBedRoom };
