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
import {
  DataGrid,
  getGridSingleSelectOperators,
  GridColDef,
  ptBR,
} from '@mui/x-data-grid';

import CustomChip from '../../../components/customChip';
import { UserAvatar } from '../../../components/userAvatar';
import { cardTabelaSx, dataGridSx } from '../../../components/listPageStyles';
import { corDoStatus, MINISTERIOS, ROTULO_DO_STATUS } from '../constants';
import { iconeDoMinisterio, nomeDoMinisterio } from '../ministerios';
import { FiltrosDaIgreja, SolicitacaoDaIgreja } from '../types';

/** O filtro do ministério: só "é", que é o que a API sabe filtrar */
const SO_IGUAL = getGridSingleSelectOperators().filter(
  (operador) => operador.value === 'is'
);

interface Props {
  /** a página atual */
  solicitacoes: SolicitacaoDaIgreja[];
  /** quantas há no filtro, somando todas as páginas */
  total: number;
  carregando: boolean;
  filtros: FiltrosDaIgreja;
  /** página, tamanho, ordem e ministério: a página da tela refaz a busca */
  onFiltros: (mudou: Partial<FiltrosDaIgreja>) => void;
  onAbrir: (solicitacao: SolicitacaoDaIgreja) => void;
}

/**
 * As solicitações da igreja: a linha (ou o botão) abre a solicitação inteira.
 *
 * Página, ordem e filtro são da API (`paginationMode`, `sortingMode` e
 * `filterMode` "server"): a lista não vem inteira. Por isso só a data ordena
 * e só o ministério filtra — é o que a API sabe fazer.
 */
function ListaDaIgreja({
  solicitacoes,
  total,
  carregando,
  filtros,
  onFiltros,
  onAbrir,
}: Props) {
  const theme = useTheme();

  const columns: GridColDef<SolicitacaoDaIgreja>[] = [
    {
      field: 'requester',
      headerName: 'Quem pediu',
      flex: 1.2,
      minWidth: 200,
      sortable: false,
      filterable: false,
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
          <Typography fontSize={14} fontWeight={600} noWrap>
            {row.requester.fullName}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'ministry',
      headerName: 'Ministério',
      width: 170,
      sortable: false,
      type: 'singleSelect',
      valueOptions: [...MINISTERIOS],
      filterOperators: SO_IGUAL,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          gap={0.75}
          sx={{
            minWidth: 0,
            color: 'text.secondary',
            '& svg': { fontSize: 17, flex: 'none' },
          }}
        >
          {iconeDoMinisterio(row.ministry)}
          <Typography fontSize={13.5} color="text.primary" noWrap>
            {nomeDoMinisterio(row)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'title',
      headerName: 'Pedido',
      flex: 2,
      minWidth: 260,
      sortable: false,
      filterable: false,
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
          <Typography
            variant="caption"
            sx={{ display: 'block', fontWeight: 600, mt: 0.25 }}
          >
            {row.items.length} {row.items.length === 1 ? 'produto' : 'produtos'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Pediu em',
      width: 110,
      filterable: false,
      valueFormatter: ({ value }) =>
        new Date(value as string).toLocaleDateString('pt-BR'),
    },
    {
      field: 'status',
      headerName: 'Situação',
      // cabe o chip mais longo, "Aceito parcialmente"
      width: 180,
      sortable: false,
      filterable: false,
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
        paginationMode="server"
        rowCount={total}
        pageSizeOptions={[25, 50]}
        // a grade conta as páginas a partir de 0; a API, de 1
        paginationModel={{ page: filtros.page - 1, pageSize: filtros.limit }}
        onPaginationModelChange={({ page, pageSize }) =>
          onFiltros({ page: page + 1, limit: pageSize })
        }
        sortingMode="server"
        sortModel={[{ field: 'createdAt', sort: filtros.ordem }]}
        onSortModelChange={([coluna]) =>
          onFiltros({ ordem: coluna?.sort === 'asc' ? 'asc' : 'desc', page: 1 })
        }
        filterMode="server"
        filterModel={{
          items: filtros.ministerio
            ? [{ field: 'ministry', operator: 'is', value: filtros.ministerio }]
            : [],
        }}
        onFilterModelChange={({ items }) =>
          onFiltros({
            ministerio:
              items.find((item) => item.field === 'ministry')?.value ||
              undefined,
            page: 1,
          })
        }
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
