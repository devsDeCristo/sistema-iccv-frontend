import {
  Avatar,
  Box,
  Card,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  GridGetRowsToExportParams,
  selectedGridRowsSelector,
  GridCellParams,
} from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { formatCPF, formatDate, formatPhoneNumber } from '../../../../utils';
// import { useNavigate } from 'react-router-dom';
import {
  ContentCopy,
  Edit,
  Key,
  MailOutline,
  MoreVert,
  SmartphoneOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { User } from '../../../../types/user';
import { ModalEditRole } from './modalEditRole';
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
    alert('Conteúdo copiado para a área de transferência!');
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
function List({ search }: { search: string }) {
  const { data = [], isLoading } = useGetUsers({});
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [openModalEditRole, setOpenModalEditRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rowSelected, setRowSelected] = useState<User | null>(null);
  const theme = useTheme();
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
      minWidth: 220,
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
    { field: 'events', headerName: 'Eventos', minWidth: 180 },
    { field: 'notes', headerName: 'Observações', flex: 1, minWidth: 80 },
    {
      field: 'role',
      headerName: 'Permissão',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridCellParams) => {
        return (
          <Box>
            {params.row.role === 1 ? (
              <Chip label="Super Admin" color="primary" variant="outlined" />
            ) : params.row.role === 5 ? (
              <Chip label="Usuário" color="success" variant="outlined" />
            ) : (
              <Chip label="Indefinido" variant="outlined" />
            )}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      flex: 1,
      minWidth: 80,
      //flex: 1,
      renderCell: (params: GridCellParams) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
        const disabledButton = user ? params.row.id === user.id : false;

        return (
          <Box key={params.id}>
            <Tooltip
              title={'Opções'}
              id="basic-button"
              onClick={(event) => handleClickOptions(event, params)}
            >
              <IconButton size="small" disabled={disabledButton}>
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
    const link = `${window.location.origin}/admin/usuario/${rowSelected?.id}/editar`;
    window.open(link, '_blank');
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
          '& .MuiDataGrid-columnHeaders': {
            height: 50, // Define a altura do cabeçalho
          },
          '& .MuiDataGrid-columnHeader': {
            height: 50,
            lineHeight: 'normal', // Ajusta o espaçamento interno do texto
          },
        }}
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
            <Edit fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Editar Usuário</ListItemText>
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
