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
  const [valueRole, setValueRole] = useState(user?.role || 5);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueRole(Number((event.target as HTMLInputElement).value));
  };
  useEffect(() => {
    if (user) {
      setValueRole(user.role || 5);
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
    if (!userId) return;
    putUser({
      userId: userId,
      data: {
        ...user,
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
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Super Admin"
                />
                <FormControlLabel
                  value={5}
                  control={<Radio />}
                  label="Usuário"
                />
              </RadioGroup>
            </FormControl>
            <Button type="submit" variant="contained" fullWidth>
              Salvar
            </Button>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalEditRole };
