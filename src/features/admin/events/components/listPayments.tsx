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
import { formatCPF } from '../../../../utils';
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
import { Edit, MoreVert, Reply } from '@mui/icons-material';
import { PaymentResponse } from '../../../../types/user';
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
    titleCard: {
      borderRadius: '5px',
      backgroundColor: theme.palette.background.paper,
      fontSize: { xs: '0.8rem', sm: '0.875rem' },
    },
    subTitleCard: {
      // no celular o valor cheio não cabe em 1.5rem sem quebrar a linha
      fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' },
      fontWeight: 600,
      color: theme.palette.text.primary,
      whiteSpace: 'nowrap',
    },
    cardMoney: {
      position: 'relative',
      p: 2,
      width: '100%',
      // os três dividem a linha em partes iguais e empilham no celular
      flex: 1,
      minWidth: 0,
    },
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
        renderCellWithCopy(`R$ ${params.value.toFixed(2)}`),
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
  interface CardTemplateProps {
    title: string;
    value: number;
  }

  const CardTemplate = ({ title, value }: CardTemplateProps) => (
    <Card sx={styles.cardMoney}>
      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          width: '5px',
          left: 0,
          top: 0,
          backgroundColor: 'primary.main',
        }}
      />
      <Typography sx={styles.subTitleCard}>
        {'R$ ' + value.toFixed(2)}
      </Typography>
      <Typography sx={styles.titleCard}>{title}</Typography>
    </Card>
  );

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="stretch"
        justifyContent="space-between"
        gap={1}
      >
        <CardTemplate
          title="Montante Total"
          value={
            payments
              ? payments.reduce((acc, payment) => acc + payment.amount, 0)
              : 0
          }
        />

        <CardTemplate
          title="Receita Realizada"
          value={
            payments
              ? payments
                  .filter((payment) => payment.status === 'PAID')
                  .reduce((acc, payment) => acc + payment.amount, 0)
              : 0
          }
        />

        <CardTemplate
          title="Receita Pendente"
          value={
            payments
              ? payments
                  .filter((payment) => payment.status !== 'PAID')
                  .reduce((acc, payment) => acc + payment.amount, 0)
              : 0
          }
        />
      </Stack>

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
