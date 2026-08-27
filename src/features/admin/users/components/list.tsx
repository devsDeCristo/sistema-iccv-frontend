import {
  alpha,
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
  GridRowId,
  gridFilteredSortedRowIdsSelector,
  GridGetRowsToExportParams,
  GridToolbar,
  selectedGridRowsSelector,
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
import { cardTabelaSx, dataGridSx } from '../../../../components/listPageStyles';
/**
 * Exporta a seleção quando existe e, sem seleção, tudo o que o filtro deixou na
 * tela — mesma regra das listas de evento.
 */
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

  /** Cor de cada perfil de acesso, na paleta de chips do tema */
  const ROLE_CHIP_COLOR: Record<number, string> = {
    [Role.SUPER_ADMIN]: theme.palette.chips.info,
    [Role.ADMIN]: theme.palette.chips.alert,
    [Role.FINANCE]: theme.palette.chips.pending,
    [Role.USER]: theme.palette.chips.success,
  };

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
              // anel discreto, do mesmo jeito que o ponto de status dos cards
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.22)}`,
            }}
          />
        );
      },
    },
    {
      field: 'fullName',
      cellClassName: 'celula-destaque',
      headerName: 'Nome',
      flex: 2,
      minWidth: 200,
      // maxWidth: 300,
      renderCell: (params) => renderCellWithCopy(params.row.fullName),
    },
    {
      field: 'cpf',
      cellClassName: 'celula-numerica',
      headerName: 'CPF',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => renderCellWithCopy(formatCPF(params.row.cpf)),
    },
    {
      field: 'birthday',
      cellClassName: 'celula-numerica',
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
              .filter((event: any) => event?.event?.status === 'ACTIVE')
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
        // perfil desconhecido cai em Usuário, como antes
        const role = Number(params.row.role);
        const cor = ROLE_CHIP_COLOR[role] || theme.palette.chips.success;
        const label = ROLE_LABELS[role] || ROLE_LABELS[Role.USER];

        return (
          <CustomChip label={label} customColor={cor} size="small" />
        );
      },
    },
    {
      field: 'createdAt',
      cellClassName: 'celula-numerica',
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
    <Card elevation={0} sx={cardTabelaSx}>
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
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        slotProps={{
          toolbar: {
            printOptions: { getRowsToExport: getSelectedRowsToExport },
          },
        }}
        columnHeaderHeight={44}
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
        sx={dataGridSx(theme)}
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
