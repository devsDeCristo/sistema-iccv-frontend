import { Header } from '../../../../components/header';
import { PageStyle } from '../../../../components/pageStyle';
import {
  Box,
  Button,
  Stack,
  Tabs,
  Tab,
  TextField,
  Paper,
  InputAdornment,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';
import { ListTeams } from '../../../../features/admin/events/components/listTeams';
import { ListBedRooms } from '../../../../features/admin/events/components/listBedRooms';
import { ModalBedRoom } from '../../../../features/admin/events/components/modalBedRoom';
import { useEffect, useState } from 'react';
import { ModalTeam } from '../../../../features/admin/events/components/modalTeam';
import { ListUsers } from '../../../../features/admin/events/components/listUsers';
import PdfEvent from '../../../../components/pdfEvent';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import {
  EventDetails,
  filterUsers,
  Team,
} from '../../../../features/admin/events/types';
import { useGetTeams } from '../../../../features/admin/events/api/getTeams';
import { useGetBedrooms } from '../../../../features/admin/events/api/getBedrooms';
import PdfBedRooms from '../../../../components/pdfRooms';
import { useGetEvents } from '../../../../features/admin/events/api/getEvents';
import PdfBadge from '../../../../components/pdfBadge';
import { ModalAddUserOnEvent } from '../../../../features/admin/events/components/modalAddUser';
import PdfEnvelope from '../../../../components/pdfEnvelope';
import {
  BadgeOutlined,
  BedOutlined,
  Download,
  EmailOutlined,
  FilterAltOutlined,
  People,
  QrCode2Outlined,
  Search,
  ViewModuleOutlined,
} from '@mui/icons-material';
import { GridApi, useGridApiRef } from '@mui/x-data-grid';
import { useGetUsers } from '../../../../features/admin/events/api/getUsers';
import FilterModal from '../../../../features/admin/events/components/filtersUserModal';
import PdfTeams from '../../../../components/pdfTeams';

import ModalQrCode from '../../../../features/admin/events/components/modalQrCode';
import PdfEnvelopePhoto from '../../../../components/pdfEnvelopePhoto';
import { User } from '../../../../types/user';
import { ListUsersWaitList } from '../../../../features/admin/events/components/listUsersWaitList';
import { ListPayments } from '../../../../features/admin/events/components/listPayments';

function Details() {
  const { id, subPage } = useParams();
  const navigate = useNavigate();
  const apiRefUsers = useGridApiRef();
  const [openModalBedRoom, setOpenModalBedRoom] = useState(false);
  const [openModalTeam, setOpenModalTeam] = useState(false);
  const [searchBedroom, setSearchBedroom] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [pageValue, setPageValue] = useState(subPage || 'usuarios');
  const [openModalAddUser, setOpenModalAddUser] = useState(false);
  const [openModalFilter, setOpenModalFilter] = useState(false);
  const [loadingPdfTeams, setLoadingPdfTeams] = useState(false);
  const [loadingPdfEvent, setLoadingPdfEvent] = useState(false);
  const [loadingPdfBadge, setLoadingPdfBadge] = useState(false);
  const [loadingPdfEnvelopePhoto, setLoadingPdfEnvelopePhoto] = useState(false);
  const [loadingPdfEnvelopeLetter, setLoadingPdfEnvelopeLetter] =
    useState(false);
  const [loadingPdfRooms, setLoadingPdfRooms] = useState(false);
  const [filtersUsers, setFiltersUsers] = useState<filterUsers>({
    birthday: { startDate: '', endDate: '' },
    city: '',
    neighborhood: '',
    worker: undefined,
  });
  const [filtersUsersSelected, setFiltersUsersSelected] = useState<number>(0);
  const { id: eventId = '' } = useParams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openModalQrCode, setOpenModalQrCode] = useState(false);
  const openMenu = Boolean(anchorEl);

  const handleClickOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseModalQrCode = () => setOpenModalQrCode(false);
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();
  const { data: teamsData = [] } = useGetTeams({
    eventId,
  });
  const teams = teamsData as unknown as Team[];
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
  const { data: usersData } = useGetUsers(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const users = usersData as User[];
  const event = eventData as EventDetails;

  const styles = {
    card: {
      borderRadius: '5px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0px 0px 3px  #0000001a',
      border: 'none',
      '&::before': {
        display: 'none',
      },
    },
    tabs: {
      '& button': {
        color: theme.palette.text.disabled,
        textTransform: 'capitalize',
        minHeight: '20px',
        Height: '100%',
        borderRadius: '5px',
        paddingX: '10px',
      },
      '& .MuiTab-icon': { marginRight: '2px' },

      '& button.Mui-selected': {
        backgroundColor: theme.palette.background.hover,
      },
      '& .MuiTabs-indicator': {
        backgroundColor: 'transparent',
        border: 'none',
      },
    },
    boxFilterAndPdf: {
      display: 'flex',
      // flexDirection: { xs: 'column', sm: 'row' },
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      mt: 2,
      p: 2,
    },
    stackButtons: {
      direction: 'row',
      flexDirection: { xs: 'column', sm: 'row' },
      // flexDirection: 'row',
      flexWrap: 'wrap',
      width: { xs: '100%', sm: 'fit-content' },
      // backgroundColor: 'red',
      gap: 2,
    },
    textField: {
      width: { xs: '100%', sm: '350px' },
    },
  };

  useEffect(() => {
    let cont = 0;
    if (filtersUsers.birthday.startDate || filtersUsers.birthday.endDate)
      cont++;
    if (filtersUsers.city) cont++;
    if (filtersUsers.neighborhood) cont++;
    setFiltersUsersSelected(cont);
  }, [filtersUsers]);

  async function generatePdfRooms() {
    setLoadingPdfRooms(true);
    setTimeout(async () => {
      let blob;

      blob = await pdf(<PdfBedRooms data={bedroomsData} />).toBlob();
      FileSaver.saveAs(blob, 'quartos.pdf');

      setLoadingPdfRooms(false);
    }, 50);
  }
  async function generatePdfBadge() {
    setLoadingPdfBadge(true);
    setTimeout(async () => {
      let blob;

      blob = await pdf(<PdfBadge data={users || []} />).toBlob();
      FileSaver.saveAs(blob, 'crachas.pdf');

      setLoadingPdfBadge(false);
    }, 50);
  }
  async function generatePdfEnvelopePhoto() {
    setLoadingPdfEnvelopePhoto(true);
    setTimeout(async () => {
      let blob;

      blob = await pdf(<PdfEnvelopePhoto />).toBlob();
      FileSaver.saveAs(blob, 'envelopes-fotos.pdf');

      setLoadingPdfEnvelopePhoto(false);
    }, 50);
  }
  async function generatePdfEnvelopeLetter() {
    setLoadingPdfEnvelopeLetter(true);
    setTimeout(async () => {
      let blob;

      blob = await pdf(
        <PdfEnvelope data={users?.filter(({ worker }) => !worker) || []} />
      ).toBlob();
      FileSaver.saveAs(blob, 'envelopes-cartas.pdf');

      setLoadingPdfEnvelopeLetter(false);
    }, 50);
  }
  async function generatePDFTeams() {
    setLoadingPdfTeams(true);
    const orderUsersByRoleTeam = teams?.map((team) => ({
      ...team,
      usersLeaders:
        team.users?.filter((user) => user.roleTeam === 'LEADER') || [],
      usersMembers:
        team.users?.filter((user) => user.roleTeam === 'MEMBER') || [],
      event: event, // Add the event property
      note: team.note || '', // Add the note property, default to empty string if undefined
    }));

    setTimeout(async () => {
      let blob;

      blob = await pdf(<PdfTeams data={orderUsersByRoleTeam} />).toBlob();
      FileSaver.saveAs(blob, 'quadrantes.pdf');

      setLoadingPdfTeams(false);
    }, 50);
  }
  async function generatePDFEvent() {
    if (!eventData || Array.isArray(eventData)) {
      return null;
    }
    setLoadingPdfEvent(true);
    const orderUsersByRoleTeam = teams?.map((team) => ({
      ...team,
      users: team.users?.sort((a, b) =>
        a.roleTeam === b.roleTeam
          ? a.fullName.localeCompare(b.fullName)
          : a.roleTeam === 'LEADER'
          ? -1
          : 1
      ),
    }));

    setTimeout(async () => {
      let blob;

      blob = await pdf(
        <PdfEvent
          data={orderUsersByRoleTeam}
          textFooter={'05 à a 08 de setembro de 2024'}
        />
      ).toBlob();
      FileSaver.saveAs(blob, 'quadrantes.pdf');

      setLoadingPdfEvent(false);
    }, 50);
  }

  const handleChange = (_: unknown, newValue: string) => {
    setPageValue(newValue);
    navigate(`/admin/eventos/${id}/detalhes/${newValue}`);
  };
  const handleExport = (apiRef: React.MutableRefObject<GridApi>) => {
    apiRef.current.exportDataAsCsv(); // Exportação nativa do DataGrid
  };
  // const handlePrint = ({ apiRef, columns }) => {
  //     // Obter TODAS as linhas diretamente do estado do grid
  //     const allRows = apiRef.current.getSortedRows();

  //     // Mapear as colunas e linhas corretamente
  //     const pdfColumns = columns.map((col) => col.headerName);
  //     const pdfRows = allRows.map((row) =>
  //       columns.map((col) => row[col.field])
  //     );

  //     // Criar PDF
  //     const doc = new jsPDF();

  //     autoTable(doc, {
  //       head: [pdfColumns],
  //       body: pdfRows,
  //       styles: {
  //         fontSize: 8,
  //         cellPadding: 2,
  //       },
  //       theme: "grid",
  //       headStyles: {
  //         fillColor: theme.palette.easyLog.primary,
  //       },
  //       alternateRowStyles: {
  //         fillColor: [240, 240, 240], // cor de fundo das linhas alternadas
  //       },
  //       margin: { top: 25, bottom: 25 },
  //       willDrawPage: (data) => {
  //         doc.addImage(
  //           LogoEasyLogSVG,
  //           "PNG",
  //           data.settings.margin.right,
  //           data.settings.margin.top - 12,
  //           36,
  //           8
  //         );
  //       },
  //       didDrawPage: (data) => {
  //         const pageHeight = doc.internal.pageSize.height;
  //         const marginRight = doc.internal.pageSize.width - 14;
  //         const marginLeft = data.settings.margin.left;

  //         doc.setDrawColor(0, 0, 0); // Cor da linha (preto)
  //         doc.setLineWidth(0.1); // Largura da linha
  //         doc.line(marginLeft, pageHeight - 15, marginRight, pageHeight - 15); // Linha horizontal
  //         // Exibe o número da página atual no rodapé
  //         doc.setFontSize(8);

  //         doc.text(`${data.pageNumber}`, marginRight - 3, pageHeight - 10);
  //         doc.text(
  //           `Made by EasyLogs - MW Solucoes LTDA. Emitido em ${new Date().toLocaleString()}`,
  //           marginLeft + 1,
  //           pageHeight - 10
  //         );
  //       },
  //     });

  //     // Salvar o PDF
  //     doc.save("todas-linhas.pdf");
  //   };

  return (
    <PageStyle>
      <Header
        title={event?.name}
        // description={(event?.startDate) + ' - ' + event?.endDate}
        description={
          event
            ? new Date(event.startDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              }) +
              ' - ' +
              new Date(event.endDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })
            : ''
        }
        buttonBack
        pageBack="/admin/eventos"
      />

      <Stack
        sx={[styles.card, { p: 0.5, height: '50px', width: 'fit-content', maxWidth: '100%' }]}
      >
        <Tabs
          value={pageValue}
          sx={styles.tabs}
          onChange={handleChange}
          aria-label="basic tabs example"
           variant="scrollable"
           scrollButtons="auto"
           allowScrollButtonsMobile
        >
          <Tab label="Inscritos" value={'usuarios'} />
          <Tab label="Lista de Espera" value={'lista-espera'} />
          <Tab label="Pagamentos" value={'pagamentos'} />
          <Tab label="Quartos" value={'quartos'} />
          <Tab label="Equipes" value={'equipes'} />
        </Tabs>
      </Stack>

      {pageValue === 'usuarios' && (
        <Stack gap={2}>
          <Paper component="div" sx={styles.boxFilterAndPdf}>
            <TextField
              placeholder="Pesquisar usuário por nome ou CPF"
              variant="outlined"
              size="small"
              value={searchUser}
              sx={styles.textField}
              onChange={(e) => setSearchUser(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            {/* <Typography color="#000">Usuários</Typography> */}
            <Stack sx={styles.stackButtons}>
              <Stack sx={{ position: 'relative' }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenModalFilter(true)}
                  startIcon={<FilterAltOutlined />}
                >
                  Filtros
                </Button>
                {filtersUsersSelected > 0 && (
                  <Chip
                    label={filtersUsersSelected}
                    size="small"
                    color="primary"
                    sx={{
                      p: 0,
                      position: 'absolute',
                      top: -7,
                      right: -7,
                    }}
                  />
                )}
              </Stack>
              <Button
                variant="outlined"
                onClick={() => handleExport(apiRefUsers)}
                startIcon={<Download />}
              >
                Exportar
              </Button >
              <Box >
                <Button
                sx={{width:{xs:'100%', sm:'fit-content'}}}
                  variant="outlined"
                  onClick={handleClickOpenMenu}
                  // onClick={() => handleDownloadPDF(2)}
                  startIcon={<EmailOutlined />}
                  disabled={loadingPdfEnvelopeLetter || loadingPdfEnvelopePhoto}
                >
                  PDF Envelopes
                </Button>
                {(loadingPdfEnvelopeLetter || loadingPdfEnvelopePhoto) && (
                  <LinearProgress />
                )}
              </Box>
              <Box>
                <Button
                sx={{width:{xs:'100%', sm:'fit-content'}}}
                  variant="outlined"
                  onClick={() => generatePdfBadge()}
                  startIcon={<BadgeOutlined />}
                >
                  PDF Crachás
                </Button>
                {loadingPdfBadge && <LinearProgress />}
              </Box>
              <Button
                variant="contained"
                onClick={() => setOpenModalAddUser(true)}
              >
                Adicionar usuário
              </Button>
            </Stack>
          </Paper>

          <ListUsers
            apiRef={apiRefUsers}
            search={searchUser}
            filters={filtersUsers}
            event={event}
          />
        </Stack>
      )}
      {pageValue === 'lista-espera' && (
        <Stack gap={2}>
          <Paper component="div" sx={styles.boxFilterAndPdf}>
            <TextField
              placeholder="Pesquisar usuário por nome ou CPF"
              variant="outlined"
              size="small"
              value={searchUser}
              sx={styles.textField}
              onChange={(e) => setSearchUser(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          <ListUsersWaitList
            apiRef={apiRefUsers}
            search={searchUser}
            event={event}
          />
        </Stack>
      )}
      {pageValue === 'pagamentos' && (
        <Stack gap={2}>
          <Paper component="div" sx={styles.boxFilterAndPdf}>
            <TextField
              placeholder="Pesquisar usuário por nome ou CPF"
              variant="outlined"
              size="small"
              value={searchUser}
              sx={styles.textField}
              onChange={(e) => setSearchUser(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            {/* <Typography color="#000">Usuários</Typography> */}
            <Stack sx={styles.stackButtons}>
              <Button
                variant="outlined"
                onClick={() => handleExport(apiRefUsers)}
                startIcon={<Download />}
              >
                Exportar
              </Button>
            </Stack>
          </Paper>

          <ListPayments
            apiRef={apiRefUsers}
            search={searchUser}
            event={event}
          />
        </Stack>
      )}

      {pageValue === 'quartos' && (
        <Stack gap={2}>
          <Paper sx={styles.boxFilterAndPdf} component="div">
            <TextField
              label="Pesquisar quarto"
              variant="outlined"
              size="small"
              value={searchBedroom}
              sx={styles.textField}
              onChange={(e) => setSearchBedroom(e.target.value)}
            />
            {/* <Typography color="#000">Quartos</Typography> */}
            <Stack sx={styles.stackButtons}>
              <Box>
                <Button
                sx={{width:{xs:'100%', sm:'fit-content'}}}
                  variant="outlined"
                  onClick={() => generatePdfRooms()}
                  startIcon={<BedOutlined />}
                  disabled={loadingPdfRooms}
                >
                  PDF quartos
                </Button>

                {loadingPdfRooms && <LinearProgress />}
              </Box>
              <Button
                variant="contained"
                onClick={() => setOpenModalBedRoom(true)}
              >
                Adicionar quarto
              </Button>
            </Stack>
          </Paper>

          <ListBedRooms search={searchBedroom} />
        </Stack>
      )}

      {pageValue === 'equipes' && (
        <Stack gap={2}>
          <Paper component="div" sx={styles.boxFilterAndPdf}>
            <TextField
              label="Pesquisar equipe"
              variant="outlined"
              size="small"
              value={searchTeam}
              sx={styles.textField}
              onChange={(e) => setSearchTeam(e.target.value)}
            />
            {/* <Typography color="#000">Times</Typography> */}
            <Stack sx={styles.stackButtons}>
              <Box>
                <Button
                sx={{width:{xs:'100%', sm:'fit-content'}}}
                  variant="outlined"
                  onClick={() => generatePDFTeams()}
                  startIcon={<People />}
                  disabled={loadingPdfTeams}
                >
                  PDF Equipes
                </Button>
                {loadingPdfTeams && <LinearProgress />}{' '}
              </Box>
              <Box>
                <Button
                sx={{width:{xs:'100%', sm:'fit-content'}}}
                  variant="outlined"
                  onClick={() => generatePDFEvent()}
                  startIcon={<ViewModuleOutlined />}
                  disabled={loadingPdfEvent}
                >
                  PDF Quadrantes
                </Button>
                {loadingPdfEvent && <LinearProgress />}
              </Box>
              <Button
                variant="outlined"
                onClick={() => setOpenModalQrCode(true)}
                startIcon={<QrCode2Outlined />}
                // disabled={loadingPdf}
              >
                Gerar QR Code
              </Button>
              <Button
                variant="contained"
                onClick={() => setOpenModalTeam(true)}
              >
                Adicionar Equipe
              </Button>
            </Stack>
          </Paper>

          <ListTeams search={searchTeam} />
        </Stack>
      )}

      <FilterModal
        open={openModalFilter}
        onClose={() => setOpenModalFilter(false)}
        onApply={(filters) => {
          setFiltersUsers(filters);
          setOpenModalFilter(false);
        }}
      />

      <ModalBedRoom
        open={openModalBedRoom}
        handleClose={() => setOpenModalBedRoom(false)}
        eventId={id || ''}
      />

      <ModalAddUserOnEvent
        open={openModalAddUser}
        handleClose={() => setOpenModalAddUser(false)}
        eventId={id || ''}
        usersAdded={users || []}
      />

      <ModalTeam
        open={openModalTeam}
        handleClose={() => setOpenModalTeam(false)}
        eventId={id || ''}
      />

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            generatePdfEnvelopeLetter();
            handleCloseMenu();
          }}
        >
          Cartas (Com nome)
        </MenuItem>
        <MenuItem
          onClick={() => {
            generatePdfEnvelopePhoto();
            handleCloseMenu();
          }}
        >
          Fotos (Sem nome)
        </MenuItem>
      </Menu>

      <ModalQrCode
        open={openModalQrCode}
        handleClose={handleCloseModalQrCode}
      />
    </PageStyle>
  );
}

export { Details };
