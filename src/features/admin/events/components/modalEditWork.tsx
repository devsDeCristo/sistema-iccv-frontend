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
// import { queryClient } from '../../../config/lib/react-query/query-client';
// import { GET_EVENTS } from '../constants';
import { useEffect, useState } from 'react';
import { User } from '../../../../types/user';
import { usePutEditRelationEventToUser } from '../api/putRelationEventUser';

interface ModalAddUserProps {
  open: boolean;
  handleClose: () => void;
  // userId: string;
  eventId: string;
  user: User | null;
}

function ModalEditWork({
  open,
  handleClose,
  eventId = '',
  user,
}: ModalAddUserProps) {
  const [valueWork, setValueWork] = useState(user?.worker === true ? 1 : 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueWork(Number((event.target as HTMLInputElement).value));
  };
  useEffect(() => {
    if (user) {
      setValueWork(user.worker === true ? 1 : 0);
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

  const { mutate: putEventToUser } = usePutEditRelationEventToUser({
    onSuccess: () => {
      reset();
      handleClose();
    },
  });

  const onSubimitEditRoleUser = () => {
    if (!eventId || !user) return;
    putEventToUser({
      idUser: user.id,
      idEvent: eventId,
      worker: valueWork === 1 ? true : false,
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
            {'Editar participação do Usuário: ' + user?.fullName}
          </Typography>
          <form onSubmit={handleSubmit(onSubimitEditRoleUser)}>
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">
                Permissões
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={valueWork}
                onChange={handleChange}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Trabalhar (Cursilheiro)"
                />
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Fazer (Cursilhista)"
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

export { ModalEditWork };
