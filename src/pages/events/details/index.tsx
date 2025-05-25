import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import {
  Card,
  Typography,
  Box,
  Button,
  Divider,
  Stack,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
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
import { useGetEvents } from '../../../features/events/api/getEvents';
import PdfBadge from '../../../components/pdfBadge';
import { ModalAddUserOnEvent } from '../../../features/events/components/modalAddUser';

function Details() {
  const { id } = useParams();

  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [openModalTeam, setOpenModalTeam] = useState(false);
  const [searchBedroom, setSearchBedroom] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [value, setValue] = useState(1);
  const [openModalAddUser, setOpenModalAddUser] = useState(false);

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
  const { data: eventData } = useGetEvents(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const event = eventData as Event;
  async function handleDownloadPDF(type: number) {
    if (!eventData || Array.isArray(eventData)) {
      return null;
    }
    let blob;
    if (type === 0) {
      blob = await pdf(
        <PdfEvent
          data={teamsData as unknown as Event[]}
          textFooter={'05 à a 08 de setembro de 2024'}
        />
      ).toBlob();
      FileSaver.saveAs(blob, 'quadrantes.pdf');
    } else if (type === 1) {
      blob = await pdf(<PdfBedRooms data={bedroomsData} />).toBlob();
      FileSaver.saveAs(blob, 'quartos.pdf');
    } else {
      blob = await pdf(
        <PdfBadge
          data={eventData.users?.filter(({ worker }) => !worker) || []}
        />
      ).toBlob();
      FileSaver.saveAs(blob, 'crachas.pdf');
    }
  }
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <PageStyle>
      <Header
        title={'Detalhes do evento: ' + event?.name}
        buttonBack
        pageBack="/eventos"
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Quartos" value={1} />
          <Tab label="Equipes" value={2} />
          <Tab label="Usuários" value={3} />
        </Tabs>
      </Box>
      {value === 1 && (
        <Box component="div">
          <Box
            component="div"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginY={2}
          >
            <TextField
              label="Pesquisar quarto"
              variant="outlined"
              size="small"
              value={searchBedroom}
              onChange={(e) => setSearchBedroom(e.target.value)}
            />
            {/* <Typography color="#000">Quartos</Typography> */}
            <Stack direction={'row'} gap={2}>
              <Button variant="outlined" onClick={() => handleDownloadPDF(1)}>
                Pdf quartos
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
            <ListBedRooms search={searchBedroom} />
          </Card>
        </Box>
      )}

      {/* <Divider color="#000" sx={{ marginY: 2 }} /> */}

      {value === 2 && (
        <Box component="div">
          <Box
            component="div"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginY={2}
          >
            <TextField
              label="Pesquisar equipe"
              variant="outlined"
              size="small"
              value={searchTeam}
              onChange={(e) => setSearchTeam(e.target.value)}
            />
            {/* <Typography color="#000">Times</Typography> */}
            <Stack direction={'row'} gap={2}>
              <Button variant="outlined" onClick={() => handleDownloadPDF(0)}>
                Gerar Quadrantes
              </Button>
              <Button
                variant="contained"
                onClick={() => setOpenModalTeam(true)}
              >
                Adicionar time
              </Button>
            </Stack>
          </Box>
          <Card sx={{ padding: 2 }}>
            <ListTeams search={searchTeam} />
          </Card>
        </Box>
      )}

      {/* <Divider color="#000" sx={{ marginY: 2 }} /> */}

      {value === 3 && (
        <Box component="div">
          <Box
            component="div"
            display="flex"
            alignItems="center"
            justifyContent="end"
            gap={2}
            marginY={2}
          >
            {/* <TextField
              label="Pesquisar usuário"
              variant="outlined"
              size="small"
              // sx={{ marginY: 2, width: '300px' }}
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            /> */}
            {/* <Typography color="#000">Usuários</Typography> */}

            <Button variant="outlined" onClick={() => handleDownloadPDF(3)}>
              Gerar Crachás
            </Button>
            <Button
              variant="contained"
              onClick={() => setOpenModalAddUser(true)}
            >
              Adicionar usuário
            </Button>
          </Box>

          <Card>
            <ListUsers search={searchUser} />
          </Card>
        </Box>
      )}

      <ModalBedRoom
        open={openModalBedRoom}
        handleClose={() => setOpenModalBedRoom(false)}
        eventId={id || ''}
      />

      <ModalAddUserOnEvent
        open={openModalAddUser}
        handleClose={() => setOpenModalAddUser(false)}
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
