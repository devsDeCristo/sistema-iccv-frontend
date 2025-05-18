import {
  Backdrop,
  Box,
  Button,
  Fade,
  FormControlLabel,
  Grid,
  Modal,
  Switch,
  Typography,
} from '@mui/material';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import { usePostCreRelationEventToUser } from '../../users/api/postRelationEventUser';
import { useGetUsers } from '../../users/api/getUsers';
import { queryClient } from '../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';

interface ModalAddUserProps {
  open: boolean;
  handleClose: () => void;
  eventId: string;
}

function ModalAddUserOnEvent({
  open,
  handleClose,
  eventId = '',
}: ModalAddUserProps) {
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

  const { data: users = [] } = useGetUsers({});

  const { mutate: postCreateRelationEventToUser } =
    usePostCreRelationEventToUser({
      onSuccess: () => {
        reset();
        queryClient.invalidateQueries(GET_EVENTS);
        handleClose();
      },
    });

  const options =
    Array.isArray(users) &&
    users?.map((user) => ({
      value: user.id,
      label: user.fullName,
    }));

  const onSubimitAddUserOnEvent = (data: any) => {
    postCreateRelationEventToUser({
      idUser: data.user.value,
      idEvent: eventId,
      worker: data.worker,
    });
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={() => {
        reset();
        handleClose();
      }}
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
            Adicionar usuário ao evento
          </Typography>
          <form onSubmit={handleSubmit(onSubimitAddUserOnEvent)}>
            <Grid mb={2}>
              <Grid item xs={12} mt={2}>
                <Controller
                  control={control}
                  name="user"
                  render={({ field: { onChange, value } }) => (
                    <Select
                      name="colors"
                      options={options || []}
                      value={value}
                      isClearable
                      onChange={onChange}
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} mt={2}>
                <Controller
                  control={control}
                  name="worker"
                  render={({ field: { onChange, value } }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(value)}
                          onChange={(e) => onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Vai trabalhar?"
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

export { ModalAddUserOnEvent };
