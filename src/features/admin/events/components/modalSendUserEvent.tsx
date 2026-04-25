import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENT_USERS, GET_EVENT_USERS_WAITLIST } from '../constants';
import { GridCellParams } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { usePutMoveUserFromEvent } from '../api/putMoveUserFromEvent';
import { useGetUsers } from '../api/getUsers';
import { User } from '../../../../types/user';

interface ModalAddUserProps {
  open: boolean;
  handleClose: () => void;
  params: GridCellParams;
  eventId: string;
}
interface UserOption {
  value: string;
  label: string;
}
interface FormValues {
  usersId: UserOption | null;
}

function ModalSenduserEvent({
  open,
  handleClose,
  eventId = '',
  params,
}: ModalAddUserProps) {
  const { mutate: mutateMoveUserFromEvent } = usePutMoveUserFromEvent({
    onSuccess: () => {
      Swal.fire({
        title: 'Inscrito!',
        text: 'Usuário movido para o evento com sucesso.',
        icon: 'success',
      });
      queryClient.invalidateQueries(GET_EVENT_USERS_WAITLIST);
      queryClient.invalidateQueries(GET_EVENT_USERS);
    },
    onError: () => {
      Swal.fire({
        title: 'Erro!',
        text: 'Ocorreu um erro ao mover o usuário para o evento, tente novamente.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    },
  });
  function mapUsersToOptions(users: User[]) {
    const roleNow = params?.row?.groupsRegistration[0].id;
    return users
      ?.filter((user) =>
        user?.groupsRegistration?.some((group) => group.id === roleNow)
      )
      .map((user) => ({
        value: user.id,
        label: user.fullName,
      }));
  }
  const theme = useTheme();

  const styles = {
    box: {
      position: 'absolute' as 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      color: '#000',
      bgcolor: 'background.paper',
      boxShadow: 14,
      p: 4,
    },
    subTitle: {
      fontWeight: 400,
      fontSize: '1rem',
      color: theme.palette.text.primary,
    },
  };
  const {
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      usersId: null,
    },
  });
  const { data: usersData } = useGetUsers(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId && open,
    }
  );
  const users = usersData as User[];

  const options = mapUsersToOptions(users || []);

  const handleMoveUserToEvent = (data: FormValues) => {
    Swal.fire({
      title: 'Inscrição de usuário!', text: 'Deseja inscrever o usuário no evento? Essa ação irá tentar inscrevê-lo automaticamente conforme as regras de ingresso e não poderá ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, inscrever no evento!',
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = '2000';
      },
    }).then((result) => {
      if (result.isConfirmed) {
        mutateMoveUserFromEvent({
          idEvent: eventId,
          idUserRemoved: data.usersId!.value,
          idUser: params.row.id,
          rule: params.row.groupsRegistration[0].roles[0]?.id,
        });
        handleClose();
      }
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
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
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
      sx={{
        '& .MuiBox-root': { borderRadius: 1 },
      }}
    >
      <Fade in={open}>
        <Box sx={styles.box}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            {'Selecione o participante que será substituído:'}
          </Typography>
          <form onSubmit={handleSubmit(handleMoveUserToEvent)}>
            <Controller
              control={control}
              name="usersId"
              rules={{
                required: 'Selecione um participante para substituir',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <Title title="Participantes" />

                  <Autocomplete<UserOption>
                    size="small"
                    options={options}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value
                    }
                    value={value}
                    onChange={(_, newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Participantes"
                        error={!!errors.usersId}
                        helperText={errors.usersId?.message}
                      />
                    )}
                  />
                </>
              )}
            />

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Salvar
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalSenduserEvent };
