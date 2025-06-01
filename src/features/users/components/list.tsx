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
import { formatDate, formatPhoneNumber } from '../../../utils';
import { useNavigate } from 'react-router-dom';
import { Edit, Key, MoreVert } from '@mui/icons-material';
import { useState } from 'react';
import { User } from '../../../types/user';
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

function List() {
  const { data = [], isLoading } = useGetUsers({});
  // const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [openModalEditRole, setOpenModalEditRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rowSelected, setRowSelected] = useState<User | null>(null);

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
    { field: 'fullName', headerName: 'Nome', flex: 1 },
    {
      field: 'birthday',
      headerName: 'Data de nascimento',
      flex: 1,
      valueGetter: (params) => formatDate(params.row.birthday),
    },
    {
      field: 'cellphone',
      headerName: 'Telefone',
      flex: 1,
      valueGetter: (params) => formatPhoneNumber(params.row.cellphone),
    },
    { field: 'religion', headerName: 'Religião', flex: 1 },
    { field: 'notes', headerName: 'Observações', flex: 1 },
    {
      field: 'role',
      headerName: 'Permissão',
      flex: 1,
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
      width: 80,
      //flex: 1,
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
  // Função para abrir o link em uma nova aba caso o Ctrl ou o Command (em Mac) esteja pressionado
  // const handleRowClick = (params: any, event: React.MouseEvent) => {
  //   if (event.ctrlKey || event.metaKey) {
  //     const link = `${window.location.origin}/user/${params.row.id}/editar`;
  //     window.open(link, '_blank');
  //   }
  // };
  const handleClickEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    const link = `${window.location.origin}/user/${rowSelected?.id}/editar`;
    window.open(link, '_blank');
    handleClose();
  };
  const handleClickEditRole = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    setOpenModalEditRole(true);
    handleClose();
  };
  return (
    <Card>
      <DataGrid
        rows={data}
        // onRowClick={handleRowClick}
        // onRowDoubleClick={(params) => {
        //   navigate(`/user/${params.row.id}/editar`);
        // }}
        autoHeight={true}
        columns={columns}
        loading={isLoading}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[10, 25, 50, 100]}
        slotProps={{
          toolbar: {
            printOptions: { getRowsToExport: getSelectedRowsToExport },
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
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
