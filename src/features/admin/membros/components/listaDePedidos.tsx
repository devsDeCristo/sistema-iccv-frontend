import { Box, Button, Card, Stack, Typography, useTheme } from '@mui/material';
import { HowToReg } from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import { UserAvatar } from '../../../../components/userAvatar';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { formatCPF, formatPhoneNumber } from '../../../../utils';
import { Pendente } from '../types';

interface Props {
  pendentes: Pendente[];
  carregando: boolean;
  ocupado: boolean;
  onAceitar: (pessoa: Pendente) => void;
  onRecusar: (pessoa: Pendente) => void;
}

/**
 * Quem escolheu esta igreja na inscrição e espera a confirmação. Aceito, vira
 * membro; recusado, o pedido some (a pessoa continua com o cadastro).
 */
function ListaDePedidos({
  pendentes,
  carregando,
  ocupado,
  onAceitar,
  onRecusar,
}: Props) {
  const theme = useTheme();

  const columns: GridColDef<Pendente>[] = [
    {
      field: 'fullName',
      headerName: 'Pessoa',
      flex: 2,
      minWidth: 230,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ py: 1 }}
        >
          <UserAvatar
            name={row.fullName}
            photoUrl={row.profilePhotoUrl}
            sx={{ width: 32, height: 32, fontSize: 13 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={600} noWrap>
              {row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatCPF(row.cpf)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'contato',
      headerName: 'Contato',
      flex: 1.3,
      minWidth: 180,
      valueGetter: ({ row }) =>
        `${formatPhoneNumber(row.cellphone)} ${row.email}`,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography fontSize={13}>
            {formatPhoneNumber(row.cellphone)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Pediu em',
      width: 120,
      valueFormatter: ({ value }) =>
        new Date(value as string).toLocaleDateString('pt-BR'),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 210,
      sortable: false,
      filterable: false,
      disableExport: true,
      align: 'right',
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            color="inherit"
            disabled={ocupado}
            onClick={() => onRecusar(row)}
            sx={{ textTransform: 'none' }}
          >
            Recusar
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={ocupado}
            onClick={() => onAceitar(row)}
            sx={{ textTransform: 'none' }}
          >
            Aceitar
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={pendentes}
        columns={columns}
        loading={carregando}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={{
          ...dataGridSx(theme),
          '& .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell': {
            minHeight: 56,
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
              <HowToReg sx={{ fontSize: 34, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                Nenhum pedido esperando
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDePedidos };
