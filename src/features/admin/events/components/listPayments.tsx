import {
  Box,
  Button,
  Card,
  IconButton,
  Paper,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
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
  Edit,
  History,
  MoreVert,
  Reply,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import { PaymentResponse } from '../../../../types/user';
import { useEffect, useMemo, useState } from 'react';
import CustomChip from '../../../../components/customChip';
import { ABA_COMPRAS_DE_PRODUTOS, itensDoPagamento } from '../products';
import {
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_COLOR,
  PAYMENT_ORIGIN,
} from '../constants';
import { toast } from 'react-toastify';
import { useGetPayments } from '../api/getPayments';
import { ModalPayment } from './modalPayments';
import { ModalPaymentHistory } from './modalPaymentHistory';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentResponse | null>(null);
  const [openModalPayment, setOpenModalPayment] = useState(false);
  const [openModalHistory, setOpenModalHistory] = useState(false);
  const [panel, setPanel] = useState<string>('1');
  const handleClose = () => {
    setAnchorEl(null);
  };
  const groupsRules = useMemo(
    () => event?.groupRoles?.map((g: any) => g.name) ?? [],
    [event]
  ) as string[];
  /**
   * Compra avulsa de produto não pertence a grupo nenhum, então fica fora da
   * régua de grupos: misturada com eles, ela se lia como se fosse mais um
   * grupo de inscrição.
   */
  const temComprasAvulsas = !!event?.products?.length;
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
      // "Reembolsado" chegava como "Reembols…" em 120
      width: 145,
      renderCell: (params) => (
        <CustomChip
          label={PAYMENT_STATUS(params.value)}
          customColor={PAYMENT_STATUS_COLOR(params.value, theme)}
        />
      ),
    },
    {
      field: 'receivedFrom',
      // "Ação" dizia que ali havia um verbo; o campo guarda de onde o dinheiro
      // veio — pelo checkout ou lançado à mão
      headerName: 'Origem',
      // 200: "Aguardando pagamento" e "Gateway de pagamento" são as etiquetas
      // mais longas, e o chip do MUI corta com reticências antes de deixar o
      // texto vazar
      width: 200,
      renderCell: (params) => (
        <CustomChip
          label={PAYMENT_ORIGIN(params.value)}
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
      // ingresso e produtos na mesma coluna: cada linha é uma compra, e o
      // ingresso é um dos itens dela
      field: 'itens',
      headerName: 'Produtos',
      width: 230,
      sortable: false,
      // é o texto que a exportação lê; sem isto a planilha sairia vazia — e é
      // por ela que se separa a entrega das camisas
      valueGetter: (params) =>
        itensDoPagamento(params.row as PaymentResponse).join('; '),
      renderCell: (params) => {
        const pagamento = params.row as PaymentResponse;
        const itens = itensDoPagamento(pagamento);

        return (
          <Stack gap={0.25} sx={{ py: 0.75 }}>
            {pagamento.purchaseType === 'PRODUCTS' && (
              <Typography variant="caption" color="text.secondary">
                Compra avulsa
              </Typography>
            )}
            {itens.map((item) => (
              <Typography key={item} variant="body2">
                {item}
              </Typography>
            ))}
          </Stack>
        );
      },
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
      if (panel === ABA_COMPRAS_DE_PRODUTOS) {
        return payment.purchaseType === 'PRODUCTS';
      }
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
  const comprasAvulsasAtivas = panel === ABA_COMPRAS_DE_PRODUTOS;

  return (
    <>
      {Array.isArray(groupsRules) && groupsRules.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="stretch"
          gap={1}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <NavTabs
              fullWidth
              // a régua fica com o grupo ativo; nas compras avulsas nenhum
              // grupo está selecionado, e `false` é como o MUI diz isso
              value={comprasAvulsasAtivas ? false : panel}
              onChange={setPanel}
              options={groupsRules.map((groupName) => ({
                value: groupName,
                label: groupName,
              }))}
            />
          </Box>

          {/* flex para o botão preencher a superfície: ela estica junto com a
              régua de abas (`alignItems="stretch"`), e o botão sozinho parava
              na altura mínima dele, sobrando faixa vazia embaixo */}
          {temComprasAvulsas && (
            <Paper
              sx={{
                borderRadius: 3,
                p: 0.5,
                flexShrink: 0,
                display: 'flex',
              }}
            >
              {/* mesma pílula das abas, em superfície própria: é um recorte
                  ao lado dos grupos, não mais um deles */}
              <Button
                fullWidth
                onClick={() =>
                  setPanel(
                    comprasAvulsasAtivas
                      ? groupsRules[0]
                      : ABA_COMPRAS_DE_PRODUTOS
                  )
                }
                startIcon={<ShoppingBagOutlined />}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  minHeight: 36,
                  px: 1.5,
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  color: comprasAvulsasAtivas
                    ? 'text.primary'
                    : 'text.disabled',
                  backgroundColor: comprasAvulsasAtivas
                    ? theme.palette.background.hover
                    : 'transparent',
                }}
              >
                {ABA_COMPRAS_DE_PRODUTOS}
              </Button>
            </Paper>
          )}
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
        <ModalPaymentHistory
          open={openModalHistory}
          handleClose={() => setOpenModalHistory(false)}
          payment={selectedPayment}
          eventId={eventId}
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
          {/*
            Depois de editar e estornar: as duas mexem no dinheiro, esta só
            conta o que já fizeram com ele. É a pergunta que vem antes de
            decidir — quem baixou, quando, e se foi gente ou a conferência
            automática.
          */}
          <MenuItem
            onClick={() => {
              setOpenModalHistory(true);
              handleClose();
            }}
          >
            <ListItemIcon>
              <History fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText>Ver histórico</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    </>
  );
}

export { ListPayments };
