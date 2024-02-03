import { Header } from '../../../components/header';
import { useForm, FormProvider } from 'react-hook-form';
import { PageStyle } from '../../../components/pageStyle';
import {
  Grid,
  Card,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ListTeams } from '../../../features/events/components/listTeams';
import { ListBedRooms } from '../../../features/events/components/listBedRooms';
import { ModalBedRoom } from '../../../features/events/components/modalBedRoom';
import { useState } from 'react';
import { ModalTeam } from '../../../features/events/components/modalTeam';
import { ListUsers } from '../../../features/events/components/listUsers';

import PdfEvent from '../../../components/pdfEvent';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { Event } from '../../../features/events/types';
import { useGetTeams } from '../../../features/events/api/getTeams';

function Details() {
  const methods = useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  console.log(id);

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [openModalTeam, setOpenModalTeam] = useState(false);

  const { id: eventId = 0 } = useParams();
  const { data: teamsData = [] } = useGetTeams({
    eventId: Number(eventId),
  });

  async function handleDownloadPDF(data: Event[]) {
    const blob = await pdf(
      <PdfEvent
        data={data}
        textFooter={'28 de setembro a 01 de outubro de 2023'}
      />
    ).toBlob();
    FileSaver.saveAs(blob, 'cursilho.pdf');
  }
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
          <Stack direction={'row'} gap={2}>
            <Button
              variant="outlined"
              onClick={() => handleDownloadPDF(teamsData as unknown as Event[])}
            >
              Gerar Relatório
            </Button>
            <Button variant="contained" onClick={() => setOpenModalTeam(true)}>
              Adicionar time
            </Button>
          </Stack>
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
          <ListUsers />
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
