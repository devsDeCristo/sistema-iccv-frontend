import {
  Backdrop,
  Box,
  Button,
  Fade,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_USERS } from '../constants';
import { usePutUser } from '../api/putUser';
import { useEffect, useState } from 'react';
import { User } from '../../../../types/user';
import { Role } from '../../../../constants/roles';
import { useRole } from '../../../../hooks/useRole';

interface ModalAddUserProps {
  open: boolean;
  handleClose: () => void;
  userId: string;
  user: User | null;
}

function ModalEditRole({
  open,
  handleClose,
  userId = '',
  user,
}: ModalAddUserProps) {
  // `??` e não `||`: o dev é -1 hoje, mas qualquer perfil futuro em 0 viraria
  // "Usuário" silenciosamente aqui.
  const [valueRole, setValueRole] = useState(user?.role ?? Role.USER);
  const { isDev } = useRole();
  // Conceder ou remover o dev é coisa de dev (o backend recusa com 403), então
  // para os demais admins o perfil nem aparece, e o formulário fica travado
  // quando o usuário editado já é dev.
  const targetIsDev = user?.role === Role.DEV;
  const blockedByDev = targetIsDev && !isDev;
  // const userLocal = JSON.parse(localStorage.getItem('user') || '{}') as User;
  // const disabledButton = userLocal ? userLocal.id === userLocal.id : false;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueRole(Number((event.target as HTMLInputElement).value));
  };
  useEffect(() => {
    if (user) {
      setValueRole(user.role ?? Role.USER);
    }
  }, [user]);
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
  const { reset, handleSubmit } = useForm();

  const { mutate: putUser } = usePutUser({
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries(GET_USERS);
      handleClose();
    },
  });

  const onSubimitEditRoleUser = () => {
    if (!userId || blockedByDev) return;
    putUser({
      userId: userId,
      data: {
        // ...user,
        role: valueRole,
      },
    });
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
        <Box sx={style}>
          <Typography id="transition-modal-title" variant="h6" component="h2">
            {'Editar Permissões do Usuário: ' + user?.fullName}
          </Typography>
          <form onSubmit={handleSubmit(onSubimitEditRoleUser)}>
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">
                Permissões
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={valueRole}
                onChange={handleChange}
              >
                {(isDev || targetIsDev) && (
                  <FormControlLabel
                    value={Role.DEV}
                    control={<Radio />}
                    disabled={!isDev}
                    label="Dev"
                  />
                )}
                <FormControlLabel
                  disabled={blockedByDev}
                  value={Role.SUPER_ADMIN}
                  control={<Radio />}
                  label="Super Admin"
                />
                <FormControlLabel
                  disabled={blockedByDev}
                  value={Role.ADMIN}
                  control={<Radio />}
                  label="Admin"
                />
                <FormControlLabel
                  disabled={blockedByDev}
                  value={Role.FINANCE}
                  control={<Radio />}
                  label="Financeiro"
                />
                <FormControlLabel
                  disabled={blockedByDev}
                  value={Role.USER}
                  control={<Radio />}
                  label="Usuário"
                />
              </RadioGroup>
            </FormControl>
            {blockedByDev && (
              <Typography fontSize={13} color="error" mb={1}>
                Perfil Dev: somente outro Dev pode alterar este acesso.
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={blockedByDev}
            >
              Salvar
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalEditRole };
