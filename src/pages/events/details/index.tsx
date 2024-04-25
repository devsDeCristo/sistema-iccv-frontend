import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { Card, Typography, Box, Button, Divider, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
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
import { useGetBedrooms } from '../../../features/events/api/getBedrooms';
import PdfBedRooms from '../../../components/pdfRooms';

function Details() {
  const { id } = useParams();

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [openModalTeam, setOpenModalTeam] = useState(false);

  const { id: eventId = '' } = useParams();
  const { data: teamsData = [] } = useGetTeams({
    eventId,
  });
  const { data: bedroomsData = [] } = useGetBedrooms(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );

  async function handleDownloadPDF(data: Event[], type: number) {
    let blob;
    if (type === 0) {
      blob = await pdf(
        <PdfEvent
          data={data}
          textFooter={'30 de maio a 02 de junho de 2024'}
        />
      ).toBlob();
      FileSaver.saveAs(blob, 'quadrantes.pdf');
    } else {
      blob = await pdf(<PdfBedRooms data={bedroomsData} />).toBlob();
      FileSaver.saveAs(blob, 'quartos.pdf');
    }
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
          <Stack direction={'row'} gap={2}>
            <Button
              variant="outlined"
              onClick={() =>
                handleDownloadPDF(teamsData as unknown as Event[], 1)
              }
            >
              Gerar Relatório
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenModalBedRoom(true)}
            >
              Adicionar quarto
            </Button>
          </Stack>
        </Box>
        <Card sx={{ padding: 2 }}>
          <ListBedRooms />
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
              onClick={() =>
                handleDownloadPDF(teamsData as unknown as Event[], 0)
              }
            >
              Gerar Relatório
            </Button>
            <Button variant="contained" onClick={() => setOpenModalTeam(true)}>
              Adicionar time
            </Button>
          </Stack>
        </Box>
        <Card sx={{ padding: 2 }}>
          <ListTeams />
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
        </Box>
        <Card>
          <ListUsers />
        </Card>
      </Box>

      <ModalBedRoom
        open={openModalBedRoom}
        handleClose={() => setOpenModalBedRoom(false)}
        eventId={id || ''}
      />

      <ModalTeam
        open={openModalTeam}
        handleClose={() => setOpenModalTeam(false)}
        eventId={id || ''}
      />
    </PageStyle>
  );
}

export { Details };
