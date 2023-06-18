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

interface ModalTeamProps {
  open: boolean;
  handleClose: () => void;
  actionSave: () => void;
  bedRoom?: any;
}

function ModalTeam({ open, handleClose, actionSave, bedRoom }: ModalTeamProps) {
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

  const options = [
    { value: 'Felipe', label: 'Felipe Queiroz' },
    { value: 'Miqueias', label: 'Miqueias Tenorio' },
  ];

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
            {bedRoom ? 'Editar ' : 'Adicionar '} time
          </Typography>
          <Grid id="transition-modal-description" my={2} container spacing={2}>
            <Grid item xs={12}>
              <Input name="name" label="Nome do time" />
            </Grid>
            <Grid item xs={12}>
              <Select
                isMulti
                name="colors"
                options={options}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </Grid>
          </Grid>
          <Button variant="contained" fullWidth onClick={actionSave}>
            Salvar
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalTeam };
