import {
  Box,
  Card,
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
import { formatCPF, formatCurrency } from '../../../../utils';
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
import {
  AccountBalanceWallet,
  Edit,
  MoreVert,
  Paid,
  PendingActions,
  Reply,
} from '@mui/icons-material';
import { PaymentResponse } from '../../../../types/user';
import {
  StatusCard,
  StatusCards,
} from '../../../../components/statusCards';
import { useEffect, useMemo, useState } from 'react';
import CustomChip from '../../../../components/customChip';
import {
  ACTION_FROM,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_COLOR,
} from '../constants';

import { toast } from 'react-toastify';
import { useGetPayments } from '../api/getPayments';
import { ModalPayment } from './modalPayments';
import { UserAvatar } from '../../../../components/userAvatar';
import { cardTabelaSx, dataGridSx } from '../../../../components/listPageStyles';
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
  const theme = useTheme();
  const payments = paymentsData as PaymentResponse[];
  const md = useMediaQuery(theme.breakpoints.up('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentResponse | null>(null);
  const [openModalPayment, setOpenModalPayment] = useState(false);
  const [panel, setPanel] = useState<string>('1');

  const styles = {
    card: {
      fontSize: '30px',
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

  const groupsRules = useMemo(
    () => event?.groupRoles?.map((g: any) => g.name) ?? [],
    [event]
  ) as string[];

  useEffect(() => {
    if (groupsRules.length > 0) {
      setPanel(groupsRules[0]);
    }
  }, [groupsRules]);

  const handleClickOptions = (
    event: React.MouseEvent<HTMLElement>,
    params: GridCellParams
  ) => {
    setSelectedPayment(params.row as PaymentResponse);
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
      renderCell: (params) => (
        <CustomChip
          label={PAYMENT_METHODS(params.value)}
          customColor={theme.palette.chips.info}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <CustomChip
          label={PAYMENT_STATUS(params.value)}
          customColor={PAYMENT_STATUS_COLOR(params.value, theme)}
        />
      ),
    },
    {
      field: 'receivedFrom',
      headerName: 'Ação',
      width: 100,
      renderCell: (params) => (
        <CustomChip
          label={ACTION_FROM(params.value)}
          customColor={theme.palette.info.main}
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 100,
      renderCell: (params) =>
        renderCellWithCopy(formatCurrency(params.value as number)),
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
      width: 50,
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
        payment.email?.toLowerCase().includes(search.toLowerCase()) ||
        // id exato do usuário: é o que a bipagem do QR do crachá joga no campo
        // de busca (aqui `id` é o do pagamento, não o da inscrição)
        payment.userId?.toLowerCase() === search.toLowerCase()
    );
    filtered = filteredByGroup(filtered);
    return filtered;
  };
  const soma = (filtro?: (payment: PaymentResponse) => boolean) =>
    (payments || [])
      .filter((payment) => (filtro ? filtro(payment) : true))
      .reduce((acc, payment) => acc + payment.amount, 0);

  /**
   * Mesma régua de cards do resto do sistema. `compact` porque valor em reais é
   * texto longo e no tamanho dos contadores estouraria a largura do card.
   */
  const cardsResumo: StatusCard[] = [
    {
      title: 'Montante total',
      value: formatCurrency(soma()),
      subtitle: 'Somando todas as inscrições',
      icon: <AccountBalanceWallet sx={{ fontSize: 20 }} />,
      color: theme.palette.primary.main,
      compact: true,
    },
    {
      title: 'Receita realizada',
      value: formatCurrency(soma((payment) => payment.status === 'PAID')),
      subtitle: 'Pagamentos confirmados',
      icon: <Paid sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.success,
      compact: true,
    },
    {
      title: 'Receita pendente',
      value: formatCurrency(soma((payment) => payment.status !== 'PAID')),
      subtitle: 'Ainda não confirmados',
      icon: <PendingActions sx={{ fontSize: 20 }} />,
      color: theme.palette.chips.alert,
      compact: true,
    },
  ];

  return (
    <>
      <StatusCards cards={cardsResumo} isLoading={isLoading} />

      {Array.isArray(groupsRules) && groupsRules.length > 0 && (
        <Stack sx={[styles.card, { p: 0.5, height: '50px' }]}>
          <Tabs
            variant={md ? 'fullWidth' : 'scrollable'}
            scrollButtons={md ? false : 'auto'}
            allowScrollButtonsMobile
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

      <Card sx={cardTabelaSx}>
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
          columnHeaderHeight={44}
          sx={dataGridSx(theme)}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
        <ModalPayment
          open={openModalPayment}
          handleClose={() => setOpenModalPayment(false)}
          payment={selectedPayment}
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
          <MenuItem
            onClick={() => {
              setOpenModalPayment(true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Editar </ListItemText>
          </MenuItem>

          <MenuItem sx={{ opacity: 0.3 }}>
            <ListItemIcon>
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
