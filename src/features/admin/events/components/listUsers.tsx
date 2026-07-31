import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { formatCPF, formatDate } from '../../../../utils';
import {
  DataGrid,
  GridApi,
  GridCellParams,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  ptBR,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useParams } from 'react-router-dom';
import { Add, Badge, Delete, Edit, MoreVert } from '@mui/icons-material';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import PdfBadge from '../../../../components/pdfBadge';
import { User } from '../../../../types/user';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useRemoveUserFromEvent } from '../api/deleteUser';
import { ModalEditWork } from './modalEditWork';
import { useGetUsers } from '../api/getUsers';
import { filterUsers } from '../types';
import dayjs from 'dayjs';
import CustomChip from '../../../../components/customChip';
import { GET_EVENT_USERS } from '../constants';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { toast } from 'react-toastify';
import { ModalAddUserOnEvent } from './modalAddUser';
const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);
  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};

const renderCellWithCopy = (value: string | number) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    //alert('Conteúdo copiado para a área de transferência!');
    toast.success('Conteúdo copiado para a área de transferência!');
  };
  return (
    <Tooltip title="Clique para copiar">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'copy',
        }}
        onClick={handleCopy}
      >
        {value}
      </Box>
    </Tooltip>
  );
};

function ListUsers({
  search,
  apiRef,
  filters,
  event,
}: {
  search: string;
  filters: filterUsers;
  apiRef: React.MutableRefObject<GridApi>;
  event: any;
}) {
  const { id: eventId = '' } = useParams();
  const { data: usersData, isLoading } = useGetUsers(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [openModalAddUser, setOpenModalAddUser] = useState(false);
  const [rowSelected, setRowSelected] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModalEditWork, setOpenModalEditWork] = useState(false);
  const [panel, setPanel] = useState<string>('1');
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('md'));

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
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { mutateAsync: mutateRemoveUserFromEvent } =
    useRemoveUserFromEvent();
  const groupsRules = useMemo(
    () => event?.groupRoles?.map((g: any) => g.name) ?? [],
    [event]
  ) as string[];
  const groupsRulesIds = useMemo(
    () =>
      event?.groupRoles?.reduce((acc: any, g: any) => {
        acc[g.name] = g.roles[0]?.id;
        return acc;
      }, {}) ?? {},
    [event]
   ) as Record<string, string>;

  useEffect(() => {
    if (groupsRules.length > 0) {
      setPanel(groupsRules[0]);
    }
  }, [groupsRules]);

  if (!usersData || !Array.isArray(usersData)) {
    return null;
  }

  // const { mutate: mutateDeleteEventUser } = useDeleteRelationEventUser({});
  async function handleDownloadPDF(data: User[]) {
    if (!data) return;
    const blob = await pdf(<PdfBadge data={data || []} event={event}  />).toBlob();
    FileSaver.saveAs(blob, 'crachas.pdf');
  }
  const handleClickOptions = (
    event: React.MouseEvent<HTMLElement>,
    params: GridCellParams
  ) => {
    setRowSelected(params.row);
    setSelectedUser(params.row as User);
    setAnchorEl(event.currentTarget);
  };

  const columns: GridColDef[] = [
    {
      sortable: false,
      field: 'foto',
      headerName: '',
      width: 60,
      renderCell: (params) => {
        return (
          <Avatar
            alt={params?.row?.fullName}
            src={params?.row?.profilePhotoUrl || '/'}
            sx={{
              width: '30px',
              height: '30px',
            }}
          />
        );
      },
    },
    {
      field: 'fullName',
      headerName: 'Nome/Crachá',
      flex: 2,
      minWidth: 180,
      // maxWidth: 300,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {params.row.badgeName}
          </Typography>
        </Stack>
      ),
    },

    {
      field: 'cpf',
      headerName: 'CPF',
      width: 140,
      renderCell: (params) => renderCellWithCopy(formatCPF(params.row.cpf)),
    },
    {
      field: 'birthday',
      headerName: 'Nascimento',
      width: 130,
      valueGetter: (params) => formatDate(params.row.birthday),
    },

    {
      field: 'city',
      headerName: 'Endereço',

      width: 170,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {params.row.neighborhood}
          </Typography>
        </Stack>
      ),
    },
    { field: 'leadershipPosition', headerName: 'Cargo na igreja', flex: 1 },
    {
      field: 'hypertensive',
      headerName: 'Hipertenso',
      flex: 1,
      valueGetter: (params) => (params.row.hypertensive ? 'Sim' : 'Não'),
    },
    {
      field: 'diabetes',
      headerName: 'Diabético',
      flex: 1,
      valueGetter: (params) => (params.row.diabetes ? 'Sim' : 'Não'),
    },
    { field: 'notes', headerName: 'Observações', flex: 1, minWidth: 80 },

    {
      field: 'cellphone',
      headerName: 'Telefone',
      width: 128,
    },
    {
      field: 'email',
      headerName: 'E-mail',
      flex: 1,
    },
    {
      field: 'emergencyContact',
      headerName: 'Contato de emergência',
      flex: 1,
    },
    {
      field: 'indicatedBy',
      headerName: 'Indicado por',
      flex: 1,
    },
    {
      field: 'religion',
      headerName: 'Religião',
      flex: 1,
    },
    {
      field: 'profession',
      headerName: 'Profissão',
      flex: 1,
    },
    {
      field: 'createdAt',
      headerName: 'Data da inscrição',
      flex: 1,
      valueGetter: (params) => formatDate(params.row.createdAt),
    },
    {
      field: 'bedrooms',
      headerName: 'Quartos',

      width: 200,
      renderCell: (params) => (
        <Stack
          direction="row"
          gap={1}
          flexWrap="wrap"
          sx={{ pt: 1, pb: 1, overflow: 'hidden' }}
        >
          {params.row.bedrooms?.map((bedroom: any) => (
            <CustomChip
              key={bedroom.id}
              label={bedroom.name}
              customColor={theme.palette.chips.default}
              size="small"
            />
          )) || 'Nenhum'}
        </Stack>
      ),
    },
    {
      field: 'teams',
      headerName: 'Equipes',

      width: 200,
      renderCell: (params) => (
        <Stack
          direction="row"
          gap={1}
          flexWrap="wrap"
          sx={{ pt: 1, pb: 1, overflow: 'hidden' }}
        >
          {params.row.teams?.map((team: any) => (
            <CustomChip
              key={team.id}
              label={team.name}
              customColor={theme.palette.chips.default}
              size="small"
            />
          )) || 'Nenhuma'}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 80,
      renderCell: (params: GridCellParams) => {
        return (
          <Box key={params.id}>
            <Tooltip
              title={'Opções'}
              id="basic-button"
              onClick={(event) => handleClickOptions(event, params)}
            >
              <IconButton size="small">
                <MoreVert color="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const handleClickEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    const link = `${window.location.origin}/admin/usuario/${rowSelected?.id}/editar`;
    window.open(link, '_blank');
    handleClose();
  };
  const handleClickDownloadBadge = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    handleDownloadPDF([rowSelected]);
    handleClose();
  };

  const handleClickRemoveUser = async () => {
    if (!rowSelected) return;

    const roleRegistrationId = rowSelected.groupsRegistration?.find(
      (group: any) => group.name === panel
    )?.roles[0]?.id;

    if (!roleRegistrationId) return;

    handleClose();

    const result = await Swal.fire({
      title: 'Tem certeza que deseja desvincular o usuário do evento?',
      text: 'Esta ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      showLoaderOnConfirm: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desvincular do evento!',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: () => !Swal.isLoading(),
      allowEscapeKey: () => !Swal.isLoading(),
      preConfirm: async () => {
        const cancelButton = Swal.getCancelButton();

        if (cancelButton) cancelButton.disabled = true;

        try {
          await mutateRemoveUserFromEvent({
            idEvent: eventId,
            idUser: rowSelected.id.toString(),
            roleRegistrationId,
          });

          return true;
        } catch (error) {
          if (cancelButton) cancelButton.disabled = false;

          Swal.showValidationMessage(
            'Não foi possível desvincular o usuário. Tente novamente.'
          );

          return false;
        }
      },
    });

    if (result.isConfirmed && result.value) {
      queryClient.invalidateQueries(GET_EVENT_USERS);
      await Swal.fire({
        title: 'Desvinculado!',
        text: 'Usuário desvinculado do evento com sucesso.',
        icon: 'success',
      });
    }
  };

  const filteredByGroup = (usersData: User[]) => {
    if (!panel || groupsRules.length === 0) return usersData;
    return usersData.filter((user) => {
      return user.groupsRegistration?.some(
        (group: any) => group.name === panel
      );
    });
  };

  const filteredData = (usersData: User[]) => {
    let filtered = usersData.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.cpf?.includes(search) ||
        user.badgeName?.toLowerCase().includes(search.toLowerCase())
    );
    filtered = filterUsers(filtered, filters);
    filtered = filteredByGroup(filtered);
    return filtered;
  };
  const normalize = (str: string) => str?.trim().normalize('NFC').toLowerCase();

  const filterUsers = (users: User[], filters: filterUsers) => {
    return users.filter((user) => {
      const { birthday, city, neighborhood } = filters;

      let isBirthdayMatch = true;
      if (birthday.startDate && birthday.endDate) {
        const userBD = dayjs(user.birthday);
        const start = dayjs(birthday.startDate);
        const end = dayjs(birthday.endDate);

        // Transformar em número "MMDD" para comparar intervalos
        const userNum = userBD.month() * 100 + userBD.date();
        const startNum = start.month() * 100 + start.date();
        const endNum = end.month() * 100 + end.date();

        if (startNum <= endNum) {
          // intervalo normal
          isBirthdayMatch = userNum >= startNum && userNum <= endNum;
        } else {
          // intervalo cruzando o ano (ex.: 20/12 até 10/01)
          isBirthdayMatch = userNum >= startNum || userNum <= endNum;
        }
      }

      const isCityMatch = city
        ? normalize(user.city) === normalize(city)
        : true;
      const isNeighborhoodMatch = neighborhood
        ? normalize(user.neighborhood) === normalize(neighborhood)
        : true;
      const isWorkerMatch =
        filters.worker !== undefined ? user.worker === filters.worker : true;
      return (
        isBirthdayMatch && isCityMatch && isNeighborhoodMatch && isWorkerMatch
      );
    });
  };

  // const handleClickEditWork = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (!rowSelected) return;
  //   setOpenModalEditWork(true);
  //   handleClose();
  // };

  return (
    <>
      {Array.isArray(groupsRules) && groupsRules.length > 0 && (
        <Stack sx={[styles.card, { p: 0.5, height: '50px' }]}>
          <Tabs
            variant={md ? 'fullWidth' : 'scrollable'}
            scrollButtons={md ? false : 'auto'}
            allowScrollButtonsMobile
            value={panel}
            sx={styles.tabs}
            key={'table_' + md}
            onChange={(_, newValue) => setPanel(newValue)}
          >
            {Array.isArray(groupsRules) &&
              groupsRules.map((groupName) => (
                <Tab key={groupName} label={groupName} value={groupName} />
              ))}
          </Tabs>
        </Stack>
      )}

      <Card sx={{position: 'relative'}}>
      <Button onClick={()=>setOpenModalAddUser(true)} startIcon={<Add />} variant='outlined' sx={{position:"absolute", top: 10, right: 10, zIndex: 100}}> Nova Inscrição</Button>
        <DataGrid
          // disableColumnFilter
          // disableDensitySelector
          // disableColumnSelector
          apiRef={apiRef}
          getRowHeight={() => 'auto'}
          rows={filteredData(usersData || [])}
          columns={columns}
          loading={isLoading}
          autoHeight={true}
          slots={{
            toolbar: GridToolbar,
          }}
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection
          initialState={{
            columns: {
              columnVisibilityModel: {
                profession: false,
                religion: false,
                indicatedBy: false,
                emergencyContact: false,
                email: false,
                leadershipPosition: false,

                // cpf: false,
                cellphone: false,
                // badgeName: false,
                diabetes: false,
                hypertensive: false,
                notes: false,
                // leadershipPosition: false,
                createdAt: false,
              },
            },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          slotProps={{
            toolbar: {
              printOptions: { getRowsToExport: getSelectedRowsToExport },
            },
          }}
          columnHeaderHeight={40}
          sx={{
            p: 2,
            '& .MuiDataGrid-row': {
              borderTop: '1px solid ' + theme.palette.divider,
              borderBottom: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'transparent', // Altera cor do rodapé
              border: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              height: '40px !important', // Define a altura do rodapé
              minHeight: '40px !important', // Define a altura do rodapé
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
              {
                outline: 'none',
              },
          }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
        <ModalEditWork
          open={openModalEditWork}
          user={selectedUser}
          eventId={eventId}
          handleClose={() => setOpenModalEditWork(false)}
        />
          <ModalAddUserOnEvent
                open={openModalAddUser}
                handleClose={() => setOpenModalAddUser(false)}
                eventId={eventId}
                usersAdded={filteredByGroup(usersData)}
                roleRegistrationId={groupsRulesIds[panel]}
                roleName={panel}
              />
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'options-button',
          }}
        >
          <MenuItem onClick={handleClickEdit}>
            <ListItemIcon>
              <Edit fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Editar Usuário</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleClickDownloadBadge}>
            <ListItemIcon>
              <Badge fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Baixar Crachá</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClickRemoveUser}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Remover do evento</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </>
  );
}

export { ListUsers };
