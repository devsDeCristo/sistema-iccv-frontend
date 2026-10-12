import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  DeleteOutline,
  EditOutlined,
  ReceiptLong,
} from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import CustomChip from '../../../../components/customChip';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { formatCurrency } from '../../../../utils';
import { ROTULO_DA_CATEGORIA, ROTULO_DA_FORMA } from '../constants';
import { Lancamento } from '../types';

/** "2026-10-03" → "03/10/2026", sem passar por fuso */
const dataCurta = (dia: string) => dia.split('-').reverse().join('/');

/** O manual sem par que alguém confirmou fora do extrato não está pendente */
const situacao = (l: Lancamento) =>
  l.conciliado
    ? 'Conciliado'
    : l.naoConstaNoBanco
      ? 'Não consta no banco'
      : 'Pendente';

interface Props {
  lancamentos: Lancamento[];
  carregando: boolean;
  onEditar: (lancamento: Lancamento) => void;
  onApagar: (lancamento: Lancamento) => void;
}

/**
 * O livro-caixa do período. Entrada em verde com "+", saída em vermelho com
 * "−": a cor sozinha não basta para quem não distingue as duas. O que veio do
 * banco leva a conta embaixo da descrição; o manual, quem pagou.
 */
function ListaDeLancamentos({
  lancamentos,
  carregando,
  onEditar,
  onApagar,
}: Props) {
  const theme = useTheme();
  const verde = theme.palette.chips.success;
  const vermelho = theme.palette.chips.canceled;

  const columns: GridColDef<Lancamento>[] = [
    {
      field: 'date',
      headerName: 'Data',
      width: 110,
      valueFormatter: ({ value }) => dataCurta(value as string),
    },
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 2,
      minWidth: 220,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0, py: 1 }}>
          <Typography fontSize={14} noWrap title={row.description}>
            {row.description}
          </Typography>
          {(row.bankAccount || row.payerName) && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {row.source === 'PLUGGY' && (
                <AccountBalance
                  sx={{ fontSize: 12, color: 'text.secondary' }}
                />
              )}
              <Typography variant="caption" color="text.secondary" noWrap>
                {[row.bankAccount, row.payerName].filter(Boolean).join(' · ')}
              </Typography>
            </Stack>
          )}
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 190,
      valueGetter: ({ row }) => ROTULO_DA_CATEGORIA[row.category],
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={ROTULO_DA_CATEGORIA[row.category]}
          customColor={row.type === 'INCOME' ? verde : vermelho}
        />
      ),
    },
    {
      field: 'user',
      headerName: 'Dizimista',
      flex: 1,
      minWidth: 150,
      valueGetter: ({ row }) => row.user?.fullName ?? '',
      renderCell: ({ value }) => (
        <Typography
          fontSize={14}
          color={value ? 'text.primary' : 'text.disabled'}
        >
          {value || '—'}
        </Typography>
      ),
    },
    {
      field: 'method',
      headerName: 'Forma',
      width: 120,
      valueGetter: ({ row }) => (row.method ? ROTULO_DA_FORMA[row.method] : ''),
    },
    {
      field: 'conciliado',
      headerName: 'Conciliação',
      description:
        'Conciliado: o lançamento manual e a transação do banco foram ligados na tela de Conciliação. Não consta no banco: dinheiro que não passou pelo banco.',
      width: 170,
      valueGetter: ({ row }) => situacao(row),
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={situacao(row)}
          customColor={
            row.conciliado
              ? theme.palette.chips.success
              : row.naoConstaNoBanco
                ? theme.palette.chips.info
                : theme.palette.chips.alert
          }
        />
      ),
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      // exportação com o sinal: saída sai negativa na planilha
      valueGetter: ({ row }) =>
        row.type === 'INCOME' ? row.amount : -row.amount,
      renderCell: ({ row }) => (
        <Typography
          fontSize={14}
          fontWeight={600}
          sx={{ color: row.type === 'INCOME' ? verde : vermelho }}
        >
          {row.type === 'INCOME' ? '+ ' : '− '}
          {formatCurrency(row.amount)}
        </Typography>
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 96,
      sortable: false,
      filterable: false,
      disableExport: true,
      align: 'right',
      renderCell: ({ row }) => (
        <Stack direction="row">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEditar(row)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.source === 'PLUGGY'
                ? 'Importado do banco: não se apaga, ajuste a categoria'
                : 'Apagar'
            }
          >
            {/* span: Tooltip não ouve botão desligado */}
            <span>
              <IconButton
                size="small"
                disabled={row.source === 'PLUGGY'}
                onClick={() => onApagar(row)}
                sx={{ '&:hover': { color: vermelho } }}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={lancamentos}
        columns={columns}
        loading={carregando}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={{
          ...dataGridSx(theme),
          '& .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell': {
            minHeight: 56,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        slots={{
          noRowsOverlay: () => (
            <Stack
              height="100%"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              py={5}
            >
              <ReceiptLong sx={{ fontSize: 34, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                Nenhum lançamento no período
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDeLancamentos };
