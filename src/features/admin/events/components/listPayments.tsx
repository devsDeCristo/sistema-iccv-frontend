import {
  Avatar,
  Box,
  Card,
  Chip,
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
import { Badge, Delete, Edit, MoreVert, Reply } from '@mui/icons-material';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import PdfBadge from '../../../../components/pdfBadge';
import { PaymentResponse, User } from '../../../../types/user';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useRemoveUserFromEvent } from '../api/deleteUser';
import { ModalEditWork } from './modalEditWork';
import { useGetUsers } from '../api/getUsers';
import { filterUsers } from '../types';
import dayjs from 'dayjs';
import CustomChip from '../../../../components/customChip';
import { ACTION_FROM, GET_EVENT_USERS, PAYMENT_METHODS, PAYMENT_STATUS, PAYMENT_STATUS_COLOR } from '../constants';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { toast } from 'react-toastify';
import { useGetPayments } from '../api/getPayments';
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

function ListPayments({
  search,
  apiRef,
  event,
}: {
  search: string;
  apiRef: React.MutableRefObject<GridApi>;
  event: any;
}) {
  const { id: eventId = '' } = useParams();
  const { data: paymentsData, isLoading } = useGetPayments(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );
  const payments = paymentsData as PaymentResponse[]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [rowSelected, setRowSelected] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModalEditWork, setOpenModalEditWork] = useState(false);
  const [panel, setPanel] = useState<string>('1');
  const theme = useTheme();

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
  const { mutate: mutateRemoveUserFromEvent } = useRemoveUserFromEvent({
    onSuccess: () => {
      Swal.fire({
        title: 'Desvinculado!',
        text: 'Usuário desvinculado do evento com sucesso.',
        icon: 'success',
      });
      queryClient.invalidateQueries(GET_EVENT_USERS);
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
  const groupsRules = useMemo(
    () => event?.groupRoles?.map((g: any) => g.name) ?? [],
    [event]
  ) as string[];

  useEffect(() => {
    if (groupsRules.length > 0) {
      setPanel(groupsRules[0]);
    }
  }, [groupsRules]);

  // const { mutate: mutateDeleteEventUser } = useDeleteRelationEventUser({});
  async function handleDownloadPDF(data: User[]) {
    if (!data) return;
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
    {
      field: 'fullName',
      headerName: 'Nome/CPF',
      flex: 2,
      minWidth: 180,
      // maxWidth: 300,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {formatCPF(params.row.cpf)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'email',
      headerName: 'E-mail',
      width: 220,
    },
     {
      field: 'method',
      headerName: 'Método de Pagamento',
      width: 180,
      renderCell: (params) => <CustomChip label={PAYMENT_METHODS(params.value)}  customColor={theme.palette.primary.main}/>,
      
    },
     {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <CustomChip label={PAYMENT_STATUS(params.value)}  customColor={PAYMENT_STATUS_COLOR(params.value, theme)} />,
    
      
    },
     {
      field: 'receivedFrom',
      headerName: 'Ação',
      width: 100,
      renderCell: (params) => <CustomChip label={ACTION_FROM(params.value)}  customColor={theme.palette.info.main} />,
      
    },
       {
      field: 'amount',
      headerName: 'Valor',
      width: 100,
      renderCell: (params) => renderCellWithCopy(`R$ ${params.value.toFixed(2)}`),
    },
    
    {
      field: 'groupName',
      headerName: 'Ingresso',
      width: 140,
      renderCell: (params) => (
        <Stack direction="column" gap={1} sx={{ p: 0.5 }}>
          <Typography>{params.value}</Typography>
          <Typography sx={{ mt: -1.5, fontWeight: 300, fontSize: '0.85rem' }}>
            {params.row.roleName}
          </Typography>
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
 

  const filteredByGroup = (payments: PaymentResponse[]) => {
    if (!panel || groupsRules.length === 0) return payments;
    return payments.filter((payment) => {
      return payment.groupName === panel;
    });
  };

  const filteredData = (paymentsData: PaymentResponse[]) => {
    let filtered = paymentsData.filter(
      (payment) =>
        payment.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        payment.cpf?.includes(search) ||
        payment.email?.toLowerCase().includes(search.toLowerCase())
    );
    filtered = filteredByGroup(filtered);
    return filtered;
  };
 

  return (
    <>
      {Array.isArray(groupsRules) && groupsRules.length > 0 && (
        <Stack sx={[styles.card, { p: 0.5, height: '50px' }]}>
          <Tabs
            variant="fullWidth"
            value={panel}
            sx={styles.tabs}
            onChange={(_, newValue) => setPanel(newValue)}
          >
            {Array.isArray(groupsRules) &&
              groupsRules.map((groupName) => (
                <Tab key={groupName} label={groupName} value={groupName} />
              ))}
          </Tabs>
        </Stack>
      )}

      <Card>
        <DataGrid
          // disableColumnFilter
          // disableDensitySelector
          // disableColumnSelector
          apiRef={apiRef}
          getRowHeight={() => 'auto'}
          rows={filteredData(payments || [])}
          columns={columns}
          loading={isLoading}
          autoHeight={true}
          slots={{
            toolbar: GridToolbar,
          }}
          pageSizeOptions={[25, 50, 100]}
          
          initialState={{
            
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
            <ListItemText>Editar </ListItemText>
            
          </MenuItem>
            <MenuItem  sx={{opacity:0.3}}>
            <ListItemIcon >
              <Reply fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Extornar </ListItemText>
            
          </MenuItem>

         
        </Menu>
      </Card>
    </>
  );
}

export { ListPayments };
