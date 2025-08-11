import {
  Avatar,
  Box,
  Card,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { formatDate } from '../../../../utils';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useGetEvents } from '../api/getEvents';
import { useParams } from 'react-router-dom';
import {
  AssignmentInd,
  Badge,
  Delete,
  Edit,
  MoreVert,
} from '@mui/icons-material';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import PdfBadge from '../../../../components/pdfBadge';
import { User } from '../../../../types/user';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRemoveUserFromEvent } from '../api/deleteUser';
import { ModalEditWork } from './modalEditWork';
const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);
  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};
function ListUsers({ search }: { search: string }) {
  const { id: eventId = '' } = useParams();
  const { data: eventData, isLoading } = useGetEvents(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [rowSelected, setRowSelected] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModalEditWork, setOpenModalEditWork] = useState(false);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { mutate: mutateRemoveUserFromEvent } = useRemoveUserFromEvent({
    onSuccess: () => {
      Swal.fire({
        title: 'Desvinculado!',
        text: 'Usuário desvinculado do evento com sucesso.',
        icon: 'success',
      });
    },
    onError: () => {
      Swal.fire({
        title: 'Erro ao remover usuário do evento',
        text: 'Ocorreu um erro ao tentar desvincular o usuário do evento. Por favor, tente novamente mais tarde.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    },
  });

  if (!eventData || Array.isArray(eventData)) {
    return null;
  }

  // const { mutate: mutateDeleteEventUser } = useDeleteRelationEventUser({});
  async function handleDownloadPDF(data: User[]) {
    if (!eventData || Array.isArray(eventData)) {
      return null;
    }
    const blob = await pdf(<PdfBadge data={data || []} />).toBlob();
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
    { field: 'fullName', headerName: 'Nome', flex: 1, minWidth: 200 },
    {
      field: 'birthday',
      headerName: 'Data de nascimento',
      width: 100,
      valueGetter: (params) => formatDate(params.row.birthday),
    },
    {
      field: 'worker',
      headerName: 'Trabalhar',
      width: 80,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
    { field: 'neighborhood', headerName: 'Bairro', flex: 1, minWidth: 100 },
    { field: 'city', headerName: 'Cidade', flex: 1, minWidth: 120 },
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
      field: 'badgeName',
      headerName: 'Nome do crachá',
      flex: 1,
    },
    {
      field: 'cellphone',
      headerName: 'Telefone',
      width: 128,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      width: 110,
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
      field: 'paid',
      headerName: 'Pago',
      width: 60,
      valueGetter: (params) => (params.row.paid ? 'Sim' : 'Não'),
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

  const handleClickRemoveUser = () => {
    if (!rowSelected) return;
    Swal.fire({
      title: 'Tem certeza que deseja desvincular o usuário do evento?',
      text: 'Esta ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, desvincular do evento!',
    }).then((result) => {
      if (result.isConfirmed) {
        mutateRemoveUserFromEvent({
          idEvent: eventId,
          idUser: rowSelected?.id.toString(),
        });
      }
    });
    handleClose();
  };
  const filteredData = (usersData: User[]) =>
    usersData.filter((user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase())
    );

  const handleClickEditWork = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    setOpenModalEditWork(true);
    handleClose();
  };
  return (
    <Card>
      <DataGrid
        rows={filteredData(eventData.users || [])}
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
              cpf: false,
              cellphone: false,
              badgeName: false,
              diabetes: false,
              hypertensive: false,
              notes: false,
              leadershipPosition: false,
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
      />
      <ModalEditWork
        open={openModalEditWork}
        user={selectedUser}
        eventId={eventData.id || ''}
        handleClose={() => setOpenModalEditWork(false)}
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
        <MenuItem onClick={handleClickEditWork}>
          <ListItemIcon>
            <AssignmentInd fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Participação no evento</ListItemText>
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
  );
}

export { ListUsers };
