import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import { Grid, Card, Typography, Box, Button, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ListTeams } from '../../../features/events/components/listTeams';
import { ListBedRooms } from '../../../features/events/components/listBedRooms';
import { ModalBedRoom } from '../../../features/events/components/modalBedRoom';
import { useState } from 'react';
import { ModalTeam } from '../../../features/events/components/modalTeam';
import { List } from '../../../features/users/components/list';

function Details() {
  const methods = useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id);

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [openModalTeam, setOpenModalTeam] = useState(false);

  return (
    <PageStyle>
      <Header title="Detalhes do evento" buttonBack pageBack="/eventos" />

      <Box component="div">
        <Box
          component="div"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography color="#000">Quartos</Typography>
          <Button variant="contained" onClick={() => setOpenModalBedRoom(true)}>
            Adicionar quarto
          </Button>
        </Box>
        <Card sx={{ padding: 2 }}>
          <Grid container spacing={2}>
            <ListBedRooms />
          </Grid>
        </Card>
      </Box>

      <Divider color="#000" sx={{ marginY: 2 }} />

      <Box component="div">
        <Box
          component="div"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography color="#000">Times</Typography>
          <Button variant="contained" onClick={() => setOpenModalTeam(true)}>
            Adicionar time
          </Button>
        </Box>
        <Card sx={{ padding: 2 }}>
          <Grid container spacing={2}>
            <ListTeams />
          </Grid>
        </Card>
      </Box>

      <Divider color="#000" sx={{ marginY: 2 }} />

      <Box component="div">
        <Box
          component="div"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography color="#000">Usuários</Typography>
          <Button variant="contained" onClick={() => navigate('/cadastro')}>
            Adicionar usuários
          </Button>
        </Box>
        <Card>
          <List />
        </Card>
      </Box>

      <FormProvider {...methods}>
        <ModalBedRoom
          open={openModalBedRoom}
          handleClose={() => setOpenModalBedRoom(false)}
          actionSave={() => {}}
        />

        <ModalTeam
          open={openModalTeam}
          handleClose={() => setOpenModalTeam(false)}
          actionSave={() => {}}
        />
      </FormProvider>
    </PageStyle>
  );
}

export { Details };
