import {
  Box,
  Button,
  Card,
  Divider,
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
  ListAlt,
  MoreVert,
  Reply,
  ShoppingBagOutlined,
} from '@mui/icons-material';
import { PaymentResponse } from '../../../../types/user';
import { useMemo, useState } from 'react';
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
/** A aba que mostra todos os pagamentos do evento, sem recorte de grupo */
const ABA_TODOS = 'Todos';

/**
 * Em "Todos", uma linha por pessoa: a inscrição e as compras avulsas dela
 * juntas. `pagamentos` guarda os de verdade — é por eles que as ações
 * (editar, histórico) andam, nunca pela linha somada.
 */
type Linha = PaymentResponse & { pagamentos?: PaymentResponse[] };

function porPessoa(lista: PaymentResponse[]): Linha[] {
  const daPessoa = new Map<string, PaymentResponse[]>();
  lista.forEach((pagamento) => {
    const chave = pagamento.userId ?? pagamento.id;
    daPessoa.set(chave, [...(daPessoa.get(chave) ?? []), pagamento]);
  });

  return [...daPessoa.values()].map((pagamentos) => ({
    ...pagamentos[0],
    id: `pessoa-${pagamentos[0].userId ?? pagamentos[0].id}`,
    amount: pagamentos.reduce((soma, p) => soma + (p.amount ?? 0), 0),
    pagamentos,
  }));
}

/** Os valores de um campo nos pagamentos da linha, sem repetição */
const distintos = <K extends keyof PaymentResponse>(linha: Linha, campo: K) => [
  ...new Set((linha.pagamentos ?? [linha]).map((p) => p[campo])),
];

/** "Inscrição Cursilhistas" / "Compra avulsa" — qual pagamento é, no menu */
const descreverPagamento = (pagamento: PaymentResponse) =>
  pagamento.purchaseType === 'PRODUCTS'
    ? 'Compra avulsa'
    : `Inscrição${pagamento.groupName ? ` ${pagamento.groupName}` : ''}`;

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
  /** os pagamentos da linha cujo menu está aberto — mais de um em "Todos" */
  const [pagamentosDoMenu, setPagamentosDoMenu] = useState<PaymentResponse[]>(
    []
  );
  const [openModalPayment, setOpenModalPayment] = useState(false);
  const [openModalHistory, setOpenModalHistory] = useState(false);
  // "Todos" de partida: é a primeira aba, e a que mostra o evento inteiro
  const [panel, setPanel] = useState<string>(ABA_TODOS);
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
  const handleClickOptions = (
    event: React.MouseEvent<HTMLElement>,
    params: GridCellParams
  ) => {
    const linha = params.row as Linha;
    const pagamentos = linha.pagamentos ?? [linha];
    setPagamentosDoMenu(pagamentos);
    // o modal recebe sempre um pagamento de verdade, não a linha somada
    setSelectedPayment(pagamentos[0]);
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
      valueGetter: (params) =>
        distintos(params.row as Linha, 'method').length > 1
          ? 'Vários'
          : params.row.method,
      renderCell: (params) => (
        <CustomChip
          label={
            params.value === 'Vários' ? 'Vários' : PAYMENT_METHODS(params.value)
          }
          customColor={theme.palette.chips.info}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      // "Reembolsado" chegava como "Reembols…" em 120
      width: 145,
      // pessoa com pagamentos em situações diferentes: "1 de 2 pagos"
      valueGetter: (params) => {
        const linha = params.row as Linha;
        if (distintos(linha, 'status').length <= 1) return linha.status;
        const pagamentos = linha.pagamentos ?? [];
        const pagos = pagamentos.filter((p) => p.status === 'PAID').length;
        return `${pagos} de ${pagamentos.length} pagos`;
      },
      renderCell: (params) => {
        const resumo =
          !!(params.row as Linha).pagamentos &&
          params.value !== params.row.status;
        return (
          <CustomChip
            label={resumo ? params.value : PAYMENT_STATUS(params.value)}
            customColor={
              resumo
                ? theme.palette.chips.alert
                : PAYMENT_STATUS_COLOR(params.value, theme)
            }
          />
        );
      },
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
      valueGetter: (params) =>
        distintos(params.row as Linha, 'receivedFrom').length > 1
          ? 'Várias'
          : params.row.receivedFrom,
      renderCell: (params) => (
        <CustomChip
          label={
            params.value === 'Várias' ? 'Várias' : PAYMENT_ORIGIN(params.value)
          }
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
      valueGetter: (params) => {
        const linha = params.row as Linha;
        return (linha.pagamentos ?? [linha])
          .flatMap(itensDoPagamento)
          .join('; ');
      },
      renderCell: (params) => {
        // em "Todos", os itens de todos os pagamentos da pessoa juntos
        const linha = params.row as Linha;
        const pagamentos = linha.pagamentos ?? [linha];
        const itens = pagamentos.flatMap(itensDoPagamento);
        const temAvulsa = pagamentos.some((p) => p.purchaseType === 'PRODUCTS');

        return (
          <Stack gap={0.25} sx={{ py: 0.75 }}>
            {temAvulsa && (
              <Typography variant="caption" color="text.secondary">
                {pagamentos.length > 1
                  ? 'Inclui compra avulsa'
                  : 'Compra avulsa'}
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
    if (!panel || panel === ABA_TODOS || groupsRules.length === 0) {
      return payments;
    }
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
    // "Todos": uma linha por pessoa, com os produtos juntos
    return panel === ABA_TODOS ? porPessoa(filtered) : filtered;
  };
  const comprasAvulsasAtivas = panel === ABA_COMPRAS_DE_PRODUTOS;
  const todosAtivo = panel === ABA_TODOS;

  /** Botão de recorte ao lado da régua de grupos: "Todos" e "Produtos Avulsos" */
  const recorte = (ativo: boolean) => ({
    flex: 1,
    borderRadius: 2,
    minHeight: 36,
    px: 1.5,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    color: ativo ? 'text.primary' : 'text.disabled',
    backgroundColor: ativo ? theme.palette.background.hover : 'transparent',
  });

  return (
    <>
      {Array.isArray(groupsRules) && groupsRules.length > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="stretch"
          gap={1}
        >
          {/* "Todos" no começo, no mesmo desenho de "Produtos Avulsos": é um
              recorte ao lado dos grupos — o evento inteiro —, não mais um
              grupo */}
          <Paper
            sx={{ borderRadius: 3, p: 0.5, flexShrink: 0, display: 'flex' }}
          >
            <Button
              fullWidth
              onClick={() => setPanel(ABA_TODOS)}
              startIcon={<ListAlt />}
              sx={recorte(todosAtivo)}
            >
              {ABA_TODOS}
            </Button>
          </Paper>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <NavTabs
              fullWidth
              // a régua fica com o grupo ativo; em "Todos" e nas compras
              // avulsas nenhum grupo está selecionado, e `false` é como o MUI
              // diz isso
              value={comprasAvulsasAtivas || todosAtivo ? false : panel}
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
                    comprasAvulsasAtivas ? ABA_TODOS : ABA_COMPRAS_DE_PRODUTOS
                  )
                }
                startIcon={<ShoppingBagOutlined />}
                sx={recorte(comprasAvulsasAtivas)}
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
          {pagamentosDoMenu.length > 1
            ? // pessoa com mais de um pagamento (aba "Todos"): as ações são
              // de cada pagamento, e o menu diz qual é qual
              pagamentosDoMenu.flatMap((pagamento, indice) => [
                indice > 0 && <Divider key={`divisor-${pagamento.id}`} />,
                <Typography
                  key={`titulo-${pagamento.id}`}
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', px: 2, pt: 1 }}
                >
                  {descreverPagamento(pagamento)} ·{' '}
                  {formatCurrency(pagamento.amount)}
                </Typography>,
                <MenuItem
                  key={`editar-${pagamento.id}`}
                  onClick={() => {
                    setSelectedPayment(pagamento);
                    setOpenModalPayment(true);
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText>Editar</ListItemText>
                </MenuItem>,
                <MenuItem
                  key={`historico-${pagamento.id}`}
                  onClick={() => {
                    setSelectedPayment(pagamento);
                    setOpenModalHistory(true);
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <History fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText>Ver histórico</ListItemText>
                </MenuItem>,
              ])
            : [
                <MenuItem
                  key="editar"
                  onClick={() => {
                    setOpenModalPayment(true);
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText>Editar </ListItemText>
                </MenuItem>,
                <MenuItem key="estornar" sx={{ opacity: 0.3 }}>
                  <ListItemIcon>
                    <Reply fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Extornar </ListItemText>
                </MenuItem>,
                // Depois de editar e estornar: as duas mexem no dinheiro, esta
                // só conta o que já fizeram com ele. É a pergunta que vem antes
                // de decidir — quem baixou, quando, e se foi gente ou a
                // conferência automática.
                <MenuItem
                  key="historico"
                  onClick={() => {
                    setOpenModalHistory(true);
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <History fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText>Ver histórico</ListItemText>
                </MenuItem>,
              ]}
        </Menu>
      </Card>
    </>
  );
}

export { ListPayments };
