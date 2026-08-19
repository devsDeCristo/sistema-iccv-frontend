import {
  Box,
  Card,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  MenuItem,
  useTheme,
  Button,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  // GridRowId,
  // gridFilteredSortedRowIdsSelector,
  // GridGetRowsToExportParams,
  // selectedGridRowsSelector,
  GridCellParams,
  ptBR,
} from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { Role, ROLE_LABELS } from '../../../../constants/roles';
import {
  formatCPF,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
} from '../../../../utils';
// import { useNavigate } from 'react-router-dom';
import {
  Key,
  MailOutline,
  MoreVert,
  SmartphoneOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { User } from '../../../../types/user';
import { ModalEditRole } from './modalEditRole';
import CustomChip from '../../../../components/customChip';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from '../../../../components/userAvatar';
// const getSelectedRowsToExport = ({
//   apiRef,
// }: GridGetRowsToExportParams): GridRowId[] => {
//   const selectedRowIds = selectedGridRowsSelector(apiRef);
//   if (selectedRowIds.size > 0) {
//     return Array.from(selectedRowIds.keys());
//   }

//   return gridFilteredSortedRowIdsSelector(apiRef);
// };
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
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}
        onClick={handleCopy}
      >
        {value}
      </Box>
    </Tooltip>
  );
};

function List({ search }: { search: string }) {
  const { data = [], isLoading } = useGetUsers({});
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [openModalEditRole, setOpenModalEditRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rowSelected, setRowSelected] = useState<User | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  if (!Array.isArray(data)) {
    return null;
  }
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClickOptions = (
    event: React.MouseEvent<HTMLElement>,
    params: GridCellParams
  ) => {
    setRowSelected(params.row);
    setSelectedUser(params.row as User);
    setAnchorEl(event.currentTarget);
  };
  const onClickEvent = (id: string) => {
    navigate(`/admin/eventos/${id}/detalhes/usuarios`);
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
      headerName: 'Nome',
      flex: 2,
      minWidth: 200,
      // maxWidth: 300,
      renderCell: (params) => renderCellWithCopy(params.row.fullName),
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => renderCellWithCopy(formatCPF(params.row.cpf)),
    },
    {
      field: 'birthday',
      headerName: 'Data de nascimento',
      flex: 1,
      minWidth: 120,
      valueGetter: (params) => formatDate(params.row.birthday),
    },
    {
      field: 'contato',
      headerName: 'Contato',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            {params.row.cellphone && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                }}
              >
                <SmartphoneOutlined color="action" fontSize="small" />
                <Box>
                  {renderCellWithCopy(formatPhoneNumber(params.row.cellphone))}
                </Box>
              </Box>
            )}
            {params.row.email && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <MailOutline color="action" fontSize="small" />
                <Box>{renderCellWithCopy(params.row.email)}</Box>
              </Box>
            )}
          </Box>
        );
      },

      // valueGetter: (params) => formatPhoneNumber(params.row.cellphone),
    },
    // {
    //   field: 'cellphone',
    //   headerName: 'Telefone',
    //   flex: 1,
    // minWidth: 128,
    //   valueGetter: (params) => formatPhoneNumber(params.row.cellphone),
    // },
    { field: 'religion', headerName: 'Religião', minWidth: 180 },
    {
      field: 'events',
      headerName: 'Eventos',
      minWidth: 300,
      flex: 4,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(params.row.events || [])
              .filter((event: any) => event?.event?.isActive)
              .map((event: any) => (
                <Button
                  key={event.event.id}
                  onClick={() => onClickEvent(event.event.id)}
                  sx={{ borderRadius: 5, p: 0, minWidth: 'auto' }}
                >
                  <CustomChip
                    customColor={theme.palette.chips.default}
                    label={event.event.name}
                    size="small"
                  />
                </Button>
              ))}
          </Box>
        );
      },
    },
    { field: 'notes', headerName: 'Observações', flex: 1, minWidth: 80 },
    {
      field: 'role',
      headerName: 'Permissão',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridCellParams) => {
        return (
          <Box>
            {params.row.role === Role.SUPER_ADMIN ? (
              <CustomChip
                label={ROLE_LABELS[Role.SUPER_ADMIN]}
                customColor={theme.palette.chips.info}
                size="small"
              />
            ) : params.row.role === Role.ADMIN ? (
              <CustomChip
                label={ROLE_LABELS[Role.ADMIN]}
                customColor={theme.palette.chips.alert}
                size="small"
              />
            ) : params.row.role === Role.FINANCE ? (
              <CustomChip
                label={ROLE_LABELS[Role.FINANCE]}
                customColor={theme.palette.chips.pending}
                size="small"
              />
            ) : (
              <CustomChip
                label={ROLE_LABELS[Role.USER]}
                customColor={theme.palette.chips.success}
                size="small"
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'Cadastrado em',
      type: 'dateTime',
      flex: 1,
      minWidth: 160,
      valueGetter: (params) =>
        params.row.createdAt ? new Date(params.row.createdAt) : null,
      renderCell: (params) => formatDateTime(params.row.createdAt),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 60,
      //flex: 1,
      renderCell: (params: GridCellParams) => {
        // const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
        // const disabledButton = user ? params.row.id === user.id : false;

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
  // Função para abrir o link em uma nova aba caso o Ctrl ou o Command (em Mac) esteja pressionado
  // const handleRowClick = (params: any, event: React.MouseEvent) => {
  //   if (event.ctrlKey || event.metaKey) {
  //     const link = `${window.location.origin}/user/${params.row.id}/editar`;
  //     window.open(link, '_blank');
  //   }
  // };
  const handleClickEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/admin/usuario/${rowSelected?.id}/editar`);
    handleClose();
  };
  const handleClickEditRole = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    setOpenModalEditRole(true);
    handleClose();
  };
  const filteredData = (usersData: User[]) =>
    usersData.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.cpf?.includes(search)
    );

  return (
    <Card>
      <DataGrid
        rows={filteredData(data || [])}
        // onRowClick={handleRowClick}
        // onRowDoubleClick={(params) => {
        //   navigate(`/user/${params.row.id}/editar`);
        // }}
        rowHeight={65}
        autoHeight={true}
        columns={columns}
        loading={isLoading}
        // slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        // slotProps={{
        //   toolbar: {
        //     printOptions: { getRowsToExport: getSelectedRowsToExport },
        //   },
        // }}
        columnHeaderHeight={40}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
          columns: {
            columnVisibilityModel: {
              birthday: false,
              notes: false,
              // profession: false,
              // religion: false,
              // indicatedBy: false,
              // emergencyContact: false,
              // email: false,
              // cpf: false,
              // cellphone: false,
              // badgeName: false,
              // diabetes: false,
              // hypertensive: false,
              // notes: false,
              // leadershipPosition: false,
              // createdAt: false,
            },
          },
        }}
        sx={{
          p: 2,
          '& .MuiDataGrid-row': {
            // borderBottom: '1px solid ' + theme.palette.divider, // Define a cor da borda entre as linhas
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
      <ModalEditRole
        open={openModalEditRole}
        user={selectedUser}
        handleClose={() => setOpenModalEditRole(false)}
        userId={rowSelected?.id || ''}
      />
      <Menu
        id="basic-menu-user-options"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'options-button',
        }}
      >
        <MenuItem onClick={handleClickEdit}>
          <ListItemIcon>
            <VisibilityOutlined fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Ver detalhes do usuário</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClickEditRole}>
          <ListItemIcon>
            <Key fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Editar Permissões</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}
export { List };
