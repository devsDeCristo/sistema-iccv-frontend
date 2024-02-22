import {
  Backdrop,
  Box,
  Button,
  Fade,
  Grid,
  Modal,
  Typography,
} from '@mui/material';
import { Input } from '../../../components/input';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { useGetEvents } from '../api/getEvents';
import { useEffect } from 'react';
import { usePostCreateTeam } from '../api/postTeam';
import { usePutTeam } from '../api/putTeam';

interface ModalTeamProps {
  open: boolean;
  handleClose: () => void;
  team?: any;
  eventId: string;
}

function ModalTeam({ open, handleClose, team, eventId }: ModalTeamProps) {
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    color: '#000',
    bgcolor: 'background.paper',
    boxShadow: 14,
    p: 4,
  };

  const { control, reset, handleSubmit } = useForm();
  const { mutate: putTeam } = usePutTeam({
    onSuccess: () => {
      reset();
      handleClose();
    },
  });
  const { mutate: postCreateTeam } = usePostCreateTeam({
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const { data: eventData } = useGetEvents(
    { eventId: eventId || '' },
    {
      enabled: !!eventId,
    }
  );

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        usersId: team.users.map((user: any) => ({
          value: user.user.id,
          label: user.user.fullName,
        })),
      });
    }
  }, [team]);

  const options =
    !Array.isArray(eventData) &&
    eventData?.users?.map((user) => ({
      value: user.id,
      label: user.fullName,
    }));

  const onSubimitTeam = (data: any) => {
    const transoformData = {
      ...data,
      usersId: data.usersId.map((user: any) => user.value),
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
    >
      <Fade in={open}>
        <Box sx={style}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            {team ? 'Editar ' : 'Adicionar '} time
          </Typography>
          <form onSubmit={handleSubmit(onSubimitTeam)}>
            <Grid
              id="transition-modal-description"
              my={2}
              container
              spacing={2}
            >
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Nome do time"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="usersId"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      isMulti
                      name="colors"
                      options={options || []}
                      value={value}
                      onChange={onChange}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  )}
                />
              </Grid>
            </Grid>
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
