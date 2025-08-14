import {
  Backdrop,
  Box,
  Button,
  Fade,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { Input } from '../../../../components/input';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { usePostCreateBedroom } from '../api/postBedroom';
import { useEffect } from 'react';
import { usePutBedroom } from '../api/putBedroom';
import { useGetEvents } from '../api/getEvents';

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
  const styles = {
    container: {
      
      position: 'absolute' as 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '90%', sm: 600 },
      color: '#000',
      bgcolor: 'background.paper',
      boxShadow: 14,
      p: 4,
    },
  };
  const { control, reset, handleSubmit } = useForm();
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

  const { data: eventData } = useGetEvents(
    { eventId: eventId || '' },
    {
      enabled: !!eventId,
    }
  );

  useEffect(() => {
    if (bedRoom) {
      reset({
        note: bedRoom.note,
        usersId: bedRoom.users.map((user: any) => ({
          value: user.id,
          label: user.fullName,
        })),
      });
    }
  }, [bedRoom]);

  const options =
    !Array.isArray(eventData) &&
    eventData?.users?.map((user: any) => ({
      value: user.id,
      label: user.fullName,
    }));

  const onSubimitBedroom = (data: any) => {
    const transoformData = {
      ...data,
      usersId: data.usersId.map((user: any) => user.value),
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
      <Typography
        id="transition-modal-title"
        sx={{ fontWeight: 400, fontSize: '1rem' }}
      >
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
          <Typography id="transition-modal-title" variant="h6" component="h2">
            {bedRoom ? 'Editar ' : 'Adicionar '} quarto
          </Typography>
          <form onSubmit={handleSubmit(onSubimitBedroom)}>
            <Grid
              id="transition-modal-description"
              my={2}
              container
              spacing={1}
            >
              <Grid item xs={6}>
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
                        size='small'
                        placeholder="Informe o nome do quarto"
                        value={value}
                        onChange={onChange}
                      />
                    </>
                  )}
                />
              </Grid>
            
              <Grid item xs={6}>
                <Controller
                  control={control}
                  name="capacity"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Title title="Capacidade" />
                      <TextField
                        fullWidth
                        type='number'
                        variant="outlined"
                        required
                        size='small'
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
                  name="tag"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Title title="Tags" />
                      <Select
                        isMulti
                        name="colors"
                        options={[
                          { value: 'Feminino', label: 'Feminino' },
                          { value: 'Masculino', label: 'Masculino' },
                          { value: 'Familia', label: 'Familia' },
                          { value: 'Outro', label: 'Outro' },
                        ]}
                        value={value?.map((tag: string) => ({
                          value: tag,
                          label: tag,
                        }))}
                        onChange={(selectedOptions) =>
                          onChange(
                            selectedOptions.map((option) => option.value)
                          )
                        }
                        className="basic-multi-select"
                        classNamePrefix="select"
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
                        rows={4}
                        fullWidth
                        variant="outlined"
                        size='small'
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
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Title title="Usuários" />
                      <Select
                        isMulti
                        name="colors"
                        options={options || []}
                        value={value}
                        onChange={onChange}
                        className="basic-multi-select"
                        classNamePrefix="select"
                      />
                    </>
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

export { ModalBedRoom };
