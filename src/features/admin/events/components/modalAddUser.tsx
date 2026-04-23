import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Fade,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENT_USERS } from '../constants';
import { useGetUsers } from '../../users/api/getUsers';
import { User } from '../../../../types/user';
import { usePostRegisterUserInEvent } from '../api/postRegisterUserInEvent';
import Swal from 'sweetalert2';
import { useState } from 'react';


interface ModalAddUserProps {
  open: boolean;
  handleClose: () => void;
  eventId: string;
  usersAdded: User[];
  roleRegistrationId?: string;
  roleName?: string;
}

function ModalAddUserOnEvent({
  open,
  handleClose,
  eventId = '',
  usersAdded = [],
  roleRegistrationId,
  roleName,
}: ModalAddUserProps) {
 
  const [loading, setLoading] = useState(false);
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

  const { data: users } = useGetUsers(
    {},
    {
      enabled: !!open,
    }
  );

  const { mutate: mutateRegisterUserInEvent } =
    usePostRegisterUserInEvent({
      onSuccess: () => {
        // Caso 3: tudo ficou em lista de espera

        Swal.fire({
          title: 'Inscrição(ões) realizada(s) com sucesso!',
          text: 'O(s) usuário(s) foram inscritos no evento com sucesso.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        queryClient.invalidateQueries([GET_EVENT_USERS, eventId]);
      },

      onError: () => {
        Swal.fire({
          title: 'Erro!',
          text: 'Ocorreu um erro ao realizar a inscrição, tente novamente.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });

  const options =
    Array.isArray(users) &&
    users
      ?.filter((user) => !usersAdded.some((u) => u.id === user.id))
      ?.map((user) => ({
        value: user.id,
        label: user.fullName,
      }));

  const onSubimitAddUserOnEvent = async (data: any) => {
    const users = data.user || [];
    setLoading(true);


    for (const user of users) {
      await new Promise((resolve, reject) => {
        mutateRegisterUserInEvent(
          {
            eventId,
            userId: user.value,
            data: {
              roleId: roleRegistrationId ? [roleRegistrationId] : [],
            },
          },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
    }
    setLoading(false);
    handleClose();
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
      sx={{
        '& .MuiBox-root': { borderRadius: 1 },
      }}
    >
      <>
      {loading && (
        <>
        <Typography>Cadastrando usuário(s)... </Typography>
        <CircularProgress aria-label="Loading…" /></>
      )}
      {!loading && (
      <Fade in={open}>
        <Box sx={style}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            Adicionar usuário(s) ao grupo: {roleName}
          </Typography>
          <form onSubmit={handleSubmit(onSubimitAddUserOnEvent)}>
            <Grid mb={2}>
              <Grid item xs={12} mt={2}>
                <Controller
                  control={control}
                  name="user"
                  render={({ field: { onChange, value } }) => (
                    // <Select
                    //   name="colors"
                    //   options={options || []}
                    //   value={value}
                    //   isClearable
                    //   onChange={onChange}
                    //   className="basic-multi-select"
                    //   classNamePrefix="select"
                    // />
                    <Autocomplete
                      multiple
                      size="small"
                      options={options || []}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      getOptionLabel={(option) => option.label}
                      onChange={(_, newValue) => {
                        onChange(newValue); // agora é um array
                      }}
                      value={value || []}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Participantes" />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" fullWidth>
              Cadastrar!
            </Button>
          </form>
        </Box>
      </Fade>
      )}</>
    </Modal>
  );
}

export { ModalAddUserOnEvent };
