import {
  alpha,
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Assignment, VisibilityOutlined } from '@mui/icons-material';
import { DataGrid, GridColDef, ptBR } from '@mui/x-data-grid';

import CustomChip from '../../../components/customChip';
import { UserAvatar } from '../../../components/userAvatar';
import { cardTabelaSx, dataGridSx } from '../../../components/listPageStyles';
import { corDoStatus, ROTULO_DO_STATUS } from '../constants';
import { SolicitacaoDaIgreja } from '../types';
import { LinkDoProduto } from './linkDoProduto';

interface Props {
  solicitacoes: SolicitacaoDaIgreja[];
  carregando: boolean;
  onAbrir: (solicitacao: SolicitacaoDaIgreja) => void;
}

/** As solicitações da igreja: a linha (ou o botão) abre a solicitação inteira */
function ListaDaIgreja({ solicitacoes, carregando, onAbrir }: Props) {
  const theme = useTheme();

  const columns: GridColDef<SolicitacaoDaIgreja>[] = [
    {
      field: 'requester',
      headerName: 'Quem pediu',
      flex: 1.2,
      minWidth: 220,
      valueGetter: ({ row }) => row.requester.fullName,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ py: 1 }}
        >
          <UserAvatar
            name={row.requester.fullName}
            photoUrl={row.requester.profilePhotoUrl ?? undefined}
            sx={{ width: 32, height: 32, fontSize: 13 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontSize={14} fontWeight={600} noWrap>
              {row.requester.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.ministry}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'title',
      headerName: 'Pedido',
      flex: 2,
      minWidth: 260,
      renderCell: ({ row }) => (
        <Box sx={{ minWidth: 0, py: 1 }}>
          <Typography fontSize={14} fontWeight={600}>
            {row.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {row.description}
          </Typography>
          {row.link && <LinkDoProduto link={row.link} />}
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Pediu em',
      width: 110,
      valueFormatter: ({ value }) =>
        new Date(value as string).toLocaleDateString('pt-BR'),
    },
    {
      field: 'status',
      headerName: 'Situação',
      width: 130,
      valueGetter: ({ row }) => ROTULO_DO_STATUS[row.status],
      renderCell: ({ row }) => (
        <CustomChip
          size="small"
          label={ROTULO_DO_STATUS[row.status]}
          customColor={corDoStatus(theme, row.status)}
        />
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 72,
      sortable: false,
      filterable: false,
      disableExport: true,
      align: 'center',
      renderCell: ({ row }) => (
        <Tooltip title="Abrir solicitação" arrow>
          <IconButton
            size="small"
            aria-label={`Abrir a solicitação ${row.title}`}
            onClick={(e) => {
              // o clique da linha também abriria: um só basta
              e.stopPropagation();
              onAbrir(row);
            }}
            sx={{
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transition: theme.transitions.create(['background-color']),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
            }}
          >
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={solicitacoes}
        columns={columns}
        loading={carregando}
        getRowHeight={() => 'auto'}
        autoHeight
        disableRowSelectionOnClick
        onRowClick={({ row }) => onAbrir(row)}
        pageSizeOptions={[25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        columnHeaderHeight={44}
        sx={{
          ...dataGridSx(theme),
          '& .MuiDataGrid-row': { cursor: 'pointer' },
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
              <Assignment sx={{ fontSize: 34, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                Nenhuma solicitação aqui
              </Typography>
            </Stack>
          ),
        }}
      />
    </Card>
  );
}

export { ListaDaIgreja };
