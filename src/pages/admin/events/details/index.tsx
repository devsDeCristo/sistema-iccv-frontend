import { Header } from '../../../../components/header';
import { PageStyle } from '../../../../components/pageStyle';
import {
  Box,
  Button,
  Stack,
  TextField,
  Paper,
  InputAdornment,
  Chip,
  LinearProgress,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';
import { ListTeams } from '../../../../features/admin/events/components/listTeams';
import { ListBedRooms } from '../../../../features/admin/events/components/listBedRooms';
import { ModalBedRoom } from '../../../../features/admin/events/components/modalBedRoom';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
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
import {
  fetchEventWithImages,
  useGetEvents,
} from '../../../../features/admin/events/api/getEvents';
import { ModalAddUserOnEvent } from '../../../../features/admin/events/components/modalAddUser';
import {
  BadgeOutlined,
  BedOutlined,
  Download,
  EmailOutlined,
  ExpandMore,
  FilterAltOutlined,
  HowToReg,
  People,
  QrCode2Outlined,
  QrCodeScannerOutlined,
  Search,
  ViewModuleOutlined,
} from '@mui/icons-material';
import {
  gridFilteredSortedRowIdsSelector,
  selectedGridRowsSelector,
  useGridApiRef,
} from '@mui/x-data-grid';
import { ModalExportUsers } from '../../../../features/admin/events/components/exportUsers/modalExportUsers';
import { ModalGeneratePdf } from '../../../../features/admin/events/components/pdfGenerator/modalGeneratePdf';
import { PdfDocType } from '../../../../features/admin/events/components/pdfGenerator/types';
import { ExportFormat } from '../../../../features/admin/events/components/exportUsers/types';
import { useGetUsers } from '../../../../features/admin/events/api/getUsers';
import FilterModal from '../../../../features/admin/events/components/filtersUserModal';
import PdfTeams from '../../../../components/pdfTeams';

import ModalQrCode from '../../../../features/admin/events/components/modalQrCode';
import { QrScannerModal } from '../../../../components/qrScanner';
import { parseBadgeCode } from '../../../../utils/qrcode';
import {
  campoBuscaSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { NavTabs } from '../../../../components/navTabs';
import { User } from '../../../../types/user';
import { ListUsersWaitList } from '../../../../features/admin/events/components/listUsersWaitList';
import { ListPayments } from '../../../../features/admin/events/components/listPayments';
import { toast } from 'react-toastify';
import { useEventRole } from '../../../../hooks/useEventRole';
import { FINANCE_EVENT_TABS } from '../../../../constants/roles';

const EVENT_TABS = [
  { label: 'Inscritos', value: 'usuarios' },
  { label: 'Lista de Espera', value: 'lista-espera' },
  { label: 'Pagamentos', value: 'pagamentos' },
  { label: 'Quartos', value: 'quartos' },
  { label: 'Equipes', value: 'equipes' },
];

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
  const [loadingPdfRooms, setLoadingPdfRooms] = useState(false);
  const [filtersUsers, setFiltersUsers] = useState<filterUsers>({
    birthday: { startDate: '', endDate: '' },
    city: '',
    neighborhood: '',
    worker: undefined,
  });
  const [filtersUsersSelected, setFiltersUsersSelected] = useState<number>(0);
  const { id: eventId = '' } = useParams();
  // exportação e PDFs: escolha do dropdown + fotografia da grade no clique
  const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(
    null
  );
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const [pdfType, setPdfType] = useState<PdfDocType | null>(null);
  const [gridFilteredUsers, setGridFilteredUsers] = useState<User[]>([]);
  const [gridSelectedUsers, setGridSelectedUsers] = useState<User[]>([]);
  const [openModalQrCode, setOpenModalQrCode] = useState(false);
  const [openQrScanner, setOpenQrScanner] = useState(false);

  const handleCloseModalQrCode = () => setOpenModalQrCode(false);
  const theme = useTheme();
  const { data: eventData, isLoading: loadingEventDetails } = useGetEvents(
    {
      eventId: eventId,
      painel: true,
    },
    {
      enabled: !!eventId,
    }
  );
  const event = eventData as EventDetails;
  /**
   * O perfil desta pessoa na igreja *deste* evento. Um admin de uma igreja
   * pode ser financeiro em outra: usar o perfil efetivo aqui abriria as abas
   * de admin num evento onde a API só a reconhece como financeiro.
   */
  const { isAdminDoEvento, resolvido } = useEventRole(event?.churchId);

  // quartos e equipes são carregados aqui só para os PDFs dessas abas.
  // Quem não administra esta igreja não tem acesso a esses endpoints: sem o
  // `enabled` a página dispararia as duas queries no mount e a pessoa veria
  // vários toasts de 403 sem ter clicado em nada.
  const { data: teamsData = [], isLoading: loadingTeams } = useGetTeams(
    {
      eventId,
    },
    {
      enabled: !!eventId && isAdminDoEvento,
    }
  );
  const teams = teamsData as unknown as Team[];
  const { data: bedroomsData = [], isLoading: loadingBedrooms } =
    useGetBedrooms(
      {
        eventId: eventId,
      },
      {
        enabled: !!eventId && isAdminDoEvento,
      }
    );
  const { data: usersData, isLoading: loadingUsers } = useGetUsers(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const users = usersData as User[];
  const queryClient = useQueryClient();

  /**
   * Evento com logo e capa em base64, para os PDFs — o `@react-pdf/renderer`
   * não busca imagem remota, precisa delas embutidas.
   *
   * Buscado só na hora de gerar, nunca na abertura da tela: embutir as imagens
   * obriga o servidor a baixá-las do Firebase Storage e custa ~1,5s na resposta.
   * Aqui esse custo cai dentro do loading do próprio gerador, e só para quem
   * realmente pediu um PDF.
   */
  async function carregarEventoParaPdf(): Promise<EventDetails> {
    if (!eventId) return event;

    try {
      const comImagens = await fetchEventWithImages(queryClient, eventId);

      return (comImagens as EventDetails) || event;
    } catch {
      // sem as imagens o PDF ainda sai, só que sem logo e capa
      return event;
    }
  }

  /**
   * Bipagem do QR do crachá: o código traz o id do inscrito, que vai para o
   * mesmo campo de busca que o operador digita — a grade filtra por ele e sobra
   * exatamente uma linha.
   *
   * Quem confere se a inscrição pertence a este evento é a própria lista: id de
   * outro evento não aparece nela e cai no aviso.
   */
  const handleQrRead = (raw: string) => {
    // fecha em qualquer leitura, inclusive na recusada: o leitor trava no
    // primeiro código lido e reabrir é um toque
    setOpenQrScanner(false);

    const userId = parseBadgeCode(raw);
    if (!userId) {
      toast.error('QR Code não reconhecido.');
      return;
    }

    setSearchUser(userId);

    const inscrito = users?.find((user) => user.id === userId);
    if (inscrito) {
      toast.success(`${inscrito.fullName} encontrado.`);
    } else {
      toast.warning('Crachá lido, mas essa inscrição não está nesta lista.');
    }
  };

  /** Adorno do campo de busca: bipar sai de dentro da própria busca */
  const qrSearchAdornment = (
    <InputAdornment position="end">
      <Tooltip title="Buscar pelo QR Code do crachá">
        <IconButton
          size="small"
          edge="end"
          onClick={() => setOpenQrScanner(true)}
        >
          <QrCodeScannerOutlined />
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );

  const styles = {
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
      ...superficieSx,
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
      ...campoBuscaSx(theme),
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
    const eventoComImagens = await carregarEventoParaPdf();
    setTimeout(async () => {
      let blob;

      blob = await pdf(
        <PdfBedRooms data={bedroomsData} event={eventoComImagens} />
      ).toBlob();
      FileSaver.saveAs(blob, 'quartos.pdf');

      setLoadingPdfRooms(false);
    }, 50);
  }
  async function generatePDFTeams() {
    if (!teams?.length) {
      toast.error(
        'Não é possível gerar o PDF: este evento ainda não possui equipes cadastradas.'
      );
      return;
    }

    setLoadingPdfTeams(true);
    const eventoComImagens = await carregarEventoParaPdf();
    const orderUsersByRoleTeam = teams?.map((team) => ({
      ...team,
      usersLeaders:
        team.users?.filter((user) => user.roleTeam === 'LEADER') || [],
      usersMembers:
        team.users?.filter((user) => user.roleTeam === 'MEMBER') || [],
      event: eventoComImagens, // Add the event property
      note: team.note || '', // Add the note property, default to empty string if undefined
    }));

    setTimeout(async () => {
      let blob;

      blob = await pdf(
        <PdfTeams data={orderUsersByRoleTeam} event={eventoComImagens} />
      ).toBlob();
      FileSaver.saveAs(blob, 'quadrantes.pdf');

      setLoadingPdfTeams(false);
    }, 50);
  }

  async function generatePDFEvent() {
    if (!eventData || Array.isArray(eventData)) {
      return null;
    }
    if (!teams?.length) {
      toast.error(
        'Não é possível gerar o PDF: este evento ainda não possui equipes cadastradas.'
      );
      return;
    }

    setLoadingPdfEvent(true);
    const eventoComImagens = await carregarEventoParaPdf();
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
        <PdfEvent data={orderUsersByRoleTeam} event={eventoComImagens} />
      ).toBlob();
      FileSaver.saveAs(blob, 'quadrantes.pdf');

      setLoadingPdfEvent(false);
    }, 50);
  }

  const handleChange = (newValue: string) => {
    setPageValue(newValue);
    navigate(`/admin/eventos/${id}/detalhes/${newValue}`);
  };

  /**
   * Só quem administra a igreja deste evento vê as cinco abas. As outras — o
   * financeiro, e o intervalo em que o evento ainda está carregando — ficam em
   * Inscritos e Pagamentos: começar pelo conjunto menor e abrir depois nunca
   * chega a oferecer uma aba que a API vai recusar.
   */
  const visibleTabs = useMemo(
    () =>
      isAdminDoEvento
        ? EVENT_TABS
        : EVENT_TABS.filter((tab) => FINANCE_EVENT_TABS.includes(tab.value)),
    [isAdminDoEvento]
  );

  // acesso direto pela URL a uma aba bloqueada volta para a primeira liberada.
  // Só depois do evento chegar: antes disso todo mundo parece financeiro, e um
  // link direto para Quartos seria jogado fora antes de dar tempo de decidir
  useEffect(() => {
    if (!resolvido) return;

    if (!visibleTabs.some((tab) => tab.value === pageValue)) {
      const fallback = visibleTabs[0].value;
      setPageValue(fallback);
      navigate(`/admin/eventos/${id}/detalhes/${fallback}`, { replace: true });
    }
  }, [resolvido, visibleTabs, pageValue, id, navigate]);
  /**
   * Lê da grade o que o usuário vê e o que marcou. `gridFilteredSortedRowIds`
   * já reflete busca, filtros e aba de grupo; `selectedGridRows` traz as linhas
   * marcadas no checkbox.
   */
  const readGridSelection = () => {
    const api = apiRefUsers.current;
    if (!api) return { filtered: [], selected: [] };

    const filtered = gridFilteredSortedRowIdsSelector(apiRefUsers)
      .map((rowId) => api.getRow(rowId) as User)
      .filter(Boolean);
    const selected = Array.from(
      selectedGridRowsSelector(apiRefUsers).values()
    ) as User[];

    return { filtered, selected };
  };

  /** Aba de pagamentos: outro conjunto de dados, segue no CSV nativo da grade */
  const handleExportPayments = () => {
    apiRefUsers.current?.exportDataAsCsv();
  };

  const handleOpenExport = (format: ExportFormat) => {
    const { filtered, selected } = readGridSelection();
    setGridFilteredUsers(filtered);
    setGridSelectedUsers(selected);
    setExportFormat(format);
    setAnchorElExport(null);
  };

  /** Crachás e envelopes: a mesma fotografia da grade, escolhas no modal */
  const handleOpenPdf = (type: PdfDocType) => {
    const { filtered, selected } = readGridSelection();
    setGridFilteredUsers(filtered);
    setGridSelectedUsers(selected);
    setPdfType(type);
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
      >
        {/* ação da tela inteira, ao lado do título: o check-in é operado em
            tela cheia, fora das abas de detalhe */}
        {isAdminDoEvento && (
          <Button
            variant="contained"
            startIcon={<HowToReg />}
            sx={{ flexShrink: 0 }}
            onClick={() => navigate(`/admin/eventos/${id}/checkin`)}
          >
            Abrir check-in
          </Button>
        )}
      </Header>

      {/* sem `mb`: o Paper de filtros logo abaixo já traz `mt: 2` */}
      <NavTabs
        value={pageValue}
        onChange={handleChange}
        options={visibleTabs}
      />

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
                endAdornment: qrSearchAdornment,
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
                onClick={(e) => setAnchorElExport(e.currentTarget)}
                startIcon={<Download />}
                endIcon={<ExpandMore />}
              >
                Exportar
              </Button>
              <Button
                sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                variant="outlined"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenPdf('envelope');
                }}
                startIcon={<EmailOutlined />}
                disabled={loadingEventDetails || loadingUsers}
              >
                PDF Envelopes
              </Button>
              <Button
                sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                variant="outlined"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenPdf('badge');
                }}
                disabled={loadingEventDetails || loadingUsers}
                startIcon={<BadgeOutlined />}
              >
                PDF Crachás
              </Button>
              {/* <Button
                variant="contained"
                onClick={() => setOpenModalAddUser(true)}
              >
                Adicionar usuário
              </Button> */}
            </Stack>
          </Paper>

          {/* grupos e grade vêm de queries diferentes: só monta com as duas
              prontas, senão uma aparece antes da outra */}
          {loadingEventDetails || loadingUsers ? (
            <LinearProgress />
          ) : (
            <ListUsers
              apiRef={apiRefUsers}
              search={searchUser}
              filters={filtersUsers}
              event={event}
            />
          )}
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
                endAdornment: qrSearchAdornment,
              }}
            />
            {/* <Typography color="#000">Usuários</Typography> */}
            <Stack sx={styles.stackButtons}>
              <Button
                variant="outlined"
                onClick={handleExportPayments}
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
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                  variant="outlined"
                  onClick={() => generatePdfRooms()}
                  startIcon={<BedOutlined />}
                  disabled={
                    loadingPdfRooms || loadingEventDetails || loadingBedrooms
                  }
                >
                  PDF quartos
                </Button>

                {loadingPdfRooms && <LinearProgress />}
              </Box>
              <Button
                variant="contained"
                disabled={loadingEventDetails}
                onClick={() => setOpenModalBedRoom(true)}
              >
                Adicionar quarto
              </Button>
            </Stack>
          </Paper>

          <ListBedRooms
            search={searchBedroom}
            groupNames={(event?.groupRoles || []).map((grupo) => grupo.name)}
          />
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
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                  variant="outlined"
                  onClick={() => generatePDFTeams()}
                  startIcon={<People />}
                  disabled={
                    loadingPdfTeams || loadingEventDetails || loadingTeams
                  }
                >
                  PDF Equipes
                </Button>
                {loadingPdfTeams && <LinearProgress />}{' '}
              </Box>
              <Box>
                <Button
                  sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                  variant="outlined"
                  onClick={() => generatePDFEvent()}
                  startIcon={<ViewModuleOutlined />}
                  disabled={
                    loadingPdfEvent || loadingEventDetails || loadingTeams
                  }
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
                disabled={loadingEventDetails || loadingTeams}
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
        groupNames={(event?.groupRoles || []).map((grupo) => grupo.name)}
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

      <ModalQrCode
        open={openModalQrCode}
        handleClose={handleCloseModalQrCode}
      />

      <QrScannerModal
        open={openQrScanner}
        onClose={() => setOpenQrScanner(false)}
        onRead={handleQrRead}
      />

      <Menu
        anchorEl={anchorElExport}
        open={Boolean(anchorElExport)}
        onClose={() => setAnchorElExport(null)}
      >
        <MenuItem onClick={() => handleOpenExport('csv')}>.csv</MenuItem>
        <MenuItem onClick={() => handleOpenExport('xlsx')}>
          .xlsx (planilha Excel)
        </MenuItem>
        <MenuItem onClick={() => handleOpenExport('pdf')}>.pdf</MenuItem>
      </Menu>

      <ModalExportUsers
        open={Boolean(exportFormat)}
        format={exportFormat}
        onClose={() => setExportFormat(null)}
        event={event}
        loadEventImages={carregarEventoParaPdf}
        teams={teams}
        allUsers={users || []}
        filteredUsers={gridFilteredUsers}
        selectedUsers={gridSelectedUsers}
      />

      <ModalGeneratePdf
        open={Boolean(pdfType)}
        type={pdfType}
        onClose={() => setPdfType(null)}
        event={event}
        loadEventImages={carregarEventoParaPdf}
        teams={teams}
        allUsers={users || []}
        filteredUsers={gridFilteredUsers}
        selectedUsers={gridSelectedUsers}
      />
    </PageStyle>
  );
}

export { Details };
