import { alpha, Box, Card, Stack, Typography, useTheme } from '@mui/material';
import { ReceiptLong } from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import CustomChip from '../../../../../components/customChip';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../../components/listPageStyles';
import { formatCurrency } from '../../../../../utils';
import {
  LancamentoDaTesouraria,
  ROTULO_DA_ORIGEM,
  ROTULO_DA_SITUACAO,
} from '../dados';

/** "2026-10-03" → "03/10/2026", sem passar por fuso */
const dataCurta = (dia: string) => dia.split('-').reverse().join('/');

interface Props {
  lancamentos: LancamentoDaTesouraria[];
}

/**
 * Os lançamentos da tesouraria, um por linha — o detalhe por trás dos cards.
 * Só leitura no MVP; o mesmo desenho do livro-caixa (entrada com "+", saída
 * com "−", para a cor não ser o único sinal).
 */
function TabelaDaTesouraria({ lancamentos }: Props) {
  const theme = useTheme();
  const verde = theme.palette.chips.success;
  const vermelho = theme.palette.chips.canceled;

  const columns: GridColDef<LancamentoDaTesouraria>[] = [
    {
      field: 'data',
      headerName: 'Data',
      width: 110,
      cellClassName: 'celula-numerica',
      valueFormatter: ({ value }) => dataCurta(value as string),
    },
    {
      field: 'descricao',
      headerName: 'Descrição',
      flex: 2,
      minWidth: 240,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0, py: 1 }}>
          <Typography fontSize={14} noWrap title={row.descricao}>
            {row.descricao}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {/* de onde veio, de que banco e, no do sistema, a conciliação */}
            {ROTULO_DA_ORIGEM[row.origem]}
            {row.banco ? ` · ${row.banco}` : ''}
            {row.situacao ? ` · ${ROTULO_DA_SITUACAO[row.situacao]}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'categoria',
      headerName: 'Categoria',
      width: 220,
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={row.categoria}
          customColor={row.tipo === 'INCOME' ? verde : vermelho}
        />
      ),
    },
    {
      field: 'valor',
      headerName: 'Valor',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      cellClassName: 'celula-numerica',
      valueGetter: ({ row }) =>
        row.tipo === 'INCOME' ? row.valor : -row.valor,
      renderCell: ({ row }) => (
        <Typography
          fontSize={14}
          fontWeight={600}
          sx={{ color: row.tipo === 'INCOME' ? verde : vermelho }}
        >
          {row.tipo === 'INCOME' ? '+ ' : '− '}
          {formatCurrency(row.valor)}
        </Typography>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={lancamentos}
        columns={columns}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'data', sort: 'desc' }] },
        }}
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

export { TabelaDaTesouraria };
