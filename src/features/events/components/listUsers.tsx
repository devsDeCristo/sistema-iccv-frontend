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
import { formatDate } from '../../../utils';
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
import { Badge, Delete, Edit, MoreVert } from '@mui/icons-material';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import PdfBadge from '../../../components/pdfBadge';
import { User } from '../../../types/user';
import { useState } from 'react';
import { useDeleteRelationEventUser } from '../../users/api/deleteRelationEventUser';
import { toast } from 'react-toastify';
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

  const handleClose = () => {
    setAnchorEl(null);
  };
  if (!eventData || Array.isArray(eventData)) {
    return null;
  }

  const { mutate: mutateDeleteEventUser } = useDeleteRelationEventUser({});
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
      field: 'worker',
      headerName: 'Trabalhar',
      flex: 1,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
    { field: 'neighborhood', headerName: 'Bairro', flex: 1 },
    { field: 'city', headerName: 'Cidade', flex: 1 },
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
    { field: 'notes', headerName: 'Observações', flex: 1 },
    {
      field: 'badgeName',
      headerName: 'Nome do crachá',
      flex: 1,
    },
    {
      field: 'cellphone',
      headerName: 'Telefone',
      flex: 1,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      flex: 1,
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
      flex: 1,
      valueGetter: (params) => (params.row.paid ? 'Sim' : 'Não'),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 80,
      //flex: 1,
      renderCell: (params: GridCellParams) => {
        // const handleClickDownloadBadge = () => {
        //   handleDownloadPDF([params.row]);
        // };

        return (
          <Box key={params.id}>
            {/* <Tooltip
              title={'Baixar crachá'}
              id="basic-button"
              onClick={handleClickDownloadBadge}
            >
              <IconButton size="small">
                <Badge color="primary" />
              </IconButton>
            </Tooltip> */}
            <Tooltip
              title={'Remover do evento'}
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
  };
  const handleClickDownloadBadge = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    handleDownloadPDF([rowSelected]);
  };
  const handleClickRemoveUser = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!rowSelected) return;
    mutateDeleteEventUser({
      eventId: eventId,
      userId: rowSelected?.id,
    });
    handleClose();
  };
  return (
    <Card>
      <DataGrid
        rows={eventData.users || []}
        columns={columns}
        loading={isLoading}
        autoHeight={true}
        // onRowClick={handleRowClick}
        slots={{
          toolbar: GridToolbar,
        }}
        pageSizeOptions={[25, 50, 100]}
        // checkboxSelection
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
  );
}

export { ListUsers };
