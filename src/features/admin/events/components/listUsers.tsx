import {
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
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { formatCPF, formatDate, formatDateTime } from '../../../../utils';
import {
  DataGrid,
  GridApi,
  GridCellParams,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  gridFilteredSortedRowIdsSelector,
  ptBR,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Add,
  Badge,
  Delete,
  MoreVert,
  VisibilityOutlined,
} from '@mui/icons-material';
import { ModalGenerateBadge } from './pdfGenerator/modalGenerateBadge';
import { User } from '../../../../types/user';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useRemoveUserFromEvent } from '../api/deleteUser';
import { ModalEditWork } from './modalEditWork';
import { useRole } from '../../../../hooks/useRole';
import { useGetUsers } from '../api/getUsers';
import { filterUsers } from '../types';
import dayjs from 'dayjs';
import CustomChip from '../../../../components/customChip';
import { GET_EVENT_USERS } from '../constants';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { toast } from 'react-toastify';
import { ModalAddUserOnEvent } from './modalAddUser';
import { UserAvatar } from '../../../../components/userAvatar';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { NavTabs } from '../../../../components/navTabs';
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
  const navigate = useNavigate();
  const { isAdmin } = useRole();
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
  /** inscrito cujo crachá está sendo gerado; o modal abre com ele */
  const [badgeUser, setBadgeUser] = useState<User | null>(null);
  // já inicia no primeiro grupo: com '1' nenhuma aba casa no primeiro render
  const [panel, setPanel] = useState<string>(
    () => event?.groupRoles?.[0]?.name ?? '1'
  );
  const theme = useTheme();
  /**
   * O botão vive dentro da toolbar do DataGrid: assim ele acompanha a largura da
   * tabela e quebra de linha em telas pequenas, em vez de flutuar sobre ela.
   */
  const CustomToolbar = useCallback(
    () => (
      <GridToolbarContainer
        sx={{
          gap: 1,
          p: 1.5,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport
            printOptions={{ getRowsToExport: getSelectedRowsToExport }}
          />
        </Box>
        {isAdmin && (
          <Button
            onClick={() => setOpenModalAddUser(true)}
            startIcon={<Add />}
            variant="outlined"
            size="small"
            sx={{
              ml: 'auto',
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Nova Inscrição
          </Button>
        )}
      </GridToolbarContainer>
    ),
    [isAdmin]
  );
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { mutateAsync: mutateRemoveUserFromEvent } = useRemoveUserFromEvent();
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
          <UserAvatar
            name={params?.row?.fullName}
            photoUrl={params?.row?.profilePhotoUrl}
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
      field: 'registeredAt',
      headerName: 'Data da inscrição',
      type: 'dateTime',
      width: 160,
      valueGetter: (params) =>
        params.row.registeredAt ? new Date(params.row.registeredAt) : null,
      valueFormatter: (params) => formatDateTime(params.value),
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
    navigate(`/admin/usuario/${rowSelected?.id}/editar`);
    handleClose();
  };
  const handleClickDownloadBadge = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    // o crachá tem opções (QR, formatação do nome): pergunta antes de gerar
    setBadgeUser(rowSelected);
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
        user.badgeName?.toLowerCase().includes(search.toLowerCase()) ||
        // id exato: é o que a bipagem do QR do crachá joga no campo de busca
        user.id?.toLowerCase() === search.toLowerCase()
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
        <NavTabs
          fullWidth
          value={panel}
          onChange={setPanel}
          options={groupsRules.map((groupName) => ({
            value: groupName,
            label: groupName,
          }))}
        />
      )}
      <Card sx={cardTabelaSx}>
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
            toolbar: CustomToolbar,
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
              },
            },
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          columnHeaderHeight={44}
          sx={dataGridSx(theme)}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
        <ModalEditWork
          open={openModalEditWork}
          user={selectedUser}
          eventId={eventId}
          handleClose={() => setOpenModalEditWork(false)}
        />
        <ModalGenerateBadge
          open={!!badgeUser}
          user={badgeUser}
          event={event}
          onClose={() => setBadgeUser(null)}
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
          {isAdmin && (
            <MenuItem onClick={handleClickEdit}>
              <ListItemIcon>
                <VisibilityOutlined fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Ver detalhes do usuário</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={handleClickDownloadBadge}>
            <ListItemIcon>
              <Badge fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Baixar Crachá</ListItemText>
          </MenuItem>
          {isAdmin && <Divider />}
          {isAdmin && (
            <MenuItem onClick={handleClickRemoveUser}>
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Remover do evento</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Card>
    </>
  );
}

export { ListUsers };
