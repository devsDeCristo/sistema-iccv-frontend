import {
  Alert,
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
  Stack,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_USERS } from '../constants';
import { usePutUser } from '../api/putUser';
import { useEffect, useState } from 'react';
import { User } from '../../../../types/user';
import { Role } from '../../../../constants/roles';
import { useUser } from '../../../../contexts/userContext';
import { useGetChurches } from '../../churches/api/getChurches';

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
  const { user: loggedUser } = useUser();
  const { data: churches = [] } = useGetChurches();
  const [valueRole, setValueRole] = useState(user?.role || 5);
  const [churchId, setChurchId] = useState(user?.churchId || '');
  const [erro, setErro] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueRole(Number((event.target as HTMLInputElement).value));
  };

  useEffect(() => {
    if (user) {
      setValueRole(user.role || 5);
      setChurchId(user.churchId || '');
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

    // é a igreja que recorta tudo o que a pessoa vai enxergar no painel, então
    // sem ela o backend recusa a promoção
    const isAdminRole = [Role.ADMIN, Role.FINANCE].includes(valueRole);
    if (isAdminRole && loggedUser?.role === Role.SUPER_ADMIN && !churchId) {
      setErro('Escolha a igreja do administrador');
      return;
    }

    setErro(null);

    putUser({
      userId: userId,
      data: {
        role: valueRole,
        ...(isAdminRole && { churchId }),
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
            <Stack spacing={2}>
              {erro && <Alert severity="error">{erro}</Alert>}
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
                  {/* o perfil de super admin não se concede a si mesmo: o
                      backend recusa, então nem aparece para os outros */}
                  {loggedUser?.role === Role.SUPER_ADMIN && (
                    <FormControlLabel
                      value={Role.SUPER_ADMIN}
                      control={<Radio />}
                      label="Super Admin"
                    />
                  )}
                  <FormControlLabel
                    value={Role.ADMIN}
                    control={<Radio />}
                    label="Admin"
                  />
                  <FormControlLabel
                    value={Role.FINANCE}
                    control={<Radio />}
                    label="Financeiro"
                  />
                  <FormControlLabel
                    value={Role.USER}
                    control={<Radio />}
                    label="Usuário"
                  />
                </RadioGroup>
              </FormControl>

              {/* Mostrar campo de church apenas se for SuperAdmin criando Admin/Financeiro */}
              {loggedUser?.role === Role.SUPER_ADMIN &&
                [Role.ADMIN, Role.FINANCE].includes(valueRole) && (
                  <FormControl fullWidth required size="small">
                    <FormLabel>Igreja</FormLabel>
                    <Select
                      value={churchId}
                      onChange={(e) => setChurchId(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Selecione uma igreja</em>
                      </MenuItem>
                      {churches.map((church) => (
                        <MenuItem key={church.id} value={church.id}>
                          {church.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

              <Button type="submit" variant="contained" fullWidth>
                Salvar
              </Button>
            </Stack>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalEditRole };
