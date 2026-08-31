import {
  Card,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  ptBR,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../api/getEvents';
import { formatDate } from '../../../../utils';
import { EditNoteOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useRole } from '../../../../hooks/useRole';
import CustomChip from '../../../../components/customChip';
import { EventStatus, EventStatusFilter } from '../types';
import { EVENT_STATUS_LABELS } from '../constants';
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
/** Cada aba do filtro olha para um status só; 'all' não passa por aqui. */
const STATUS_DO_FILTRO: Record<
  Exclude<EventStatusFilter, 'all'>,
  EventStatus
> = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  test: 'TEST',
};

function List({
  search,
  status = 'active',
  churchId = '',
}: {
  search: string;
  status?: EventStatusFilter;
  /** vazio = todas. Só o super admin recebe evento de mais de uma igreja */
  churchId?: string;
}) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAdmin, isSuperAdmin } = useRole();
  const { data: eventData, isLoading } = useGetEvents({ painel: true });
  const events = Array.isArray(eventData) ? eventData : [];
  const filteredData = events.filter((event: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = event.name.toLowerCase().includes(searchLower);
    const matchesStatus =
      status === 'all' ? true : event.status === STATUS_DO_FILTRO[status];
    const matchesChurch = !churchId || event.church?.id === churchId;

    return matchesSearch && matchesStatus && matchesChurch;
  });
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 2,   minWidth: 180, },
    // a coluna só faz sentido para quem enxerga mais de uma igreja
    ...(isSuperAdmin
      ? [
          {
            field: 'church',
            headerName: 'Igreja',
            width: 170,
            valueGetter: (params: any) => params.row.church?.name || '—',
          },
        ]
      : []),
    {
      field: 'startDate',
      headerName: 'Data inicial',
      width: 100,
      valueGetter: (params) => formatDate(params.row.startDate),
    },
    {
      field: 'endDate',
      headerName: 'Data final',
      width: 100,
      valueGetter: (params) => formatDate(params.row.endDate),
    },
    {
      field: 'location',
      headerName: 'Local',
      width: 200,
      valueGetter: () => 'Chácara Monte Moriá',
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CustomChip
          label={params.value || 'Cursilho'}
          size="small"
          customColor={theme.palette.chips.default}
        />
      ),
    },
    {
      field: 'users',
      headerName: 'Inscritos',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const users = params?.row?.users;
        const capacity = params?.row?.capacity;

        return (
          <Stack direction="row" alignItems="center">
            <Typography>
              {users}/{capacity}
              <LinearProgress
                variant="determinate"
                value={(users / (capacity || 0)) * 100}
              />
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'waitlist',
      headerName: 'Em espera',
      width: 100,
      align: 'center',
      headerAlign: 'center',
       renderCell: (params) => {
        return (
          <Stack direction="column" alignItems="center">
            <Typography color={theme.palette.text.primary} variant="body2">
              {params.value || 0}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {'Aguardando'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'bedrooms',
      headerName: 'Quartos',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <Stack direction="column" alignItems="center">
            <Typography color={theme.palette.text.primary} variant="body2">
              {params.row._count?.bedrooms || 0}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {'Quartos'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'team',
      headerName: 'Equipes',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        return (
          <Stack direction="column" alignItems="center">
            <Typography color={theme.palette.text.primary} variant="body2">
              {params.row._count?.Team || 0}
            </Typography>
            <Typography color={theme.palette.text.secondary} variant="caption">
              {'Equipes'}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CustomChip
          label={EVENT_STATUS_LABELS[params.value] || 'Inativo'}
          // teste em cor de atenção: é um evento que existe mas não está no ar
          customColor={
            params.value === 'ACTIVE'
              ? theme.palette.chips.success
              : params.value === 'TEST'
                ? theme.palette.chips.alert
                : theme.palette.chips.canceled
          }
          size="small"
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Ações',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <>
          <Tooltip title="Detalhes">
            <IconButton
              onClick={() =>
                navigate(`/admin/eventos/${params.row.id}/detalhes/usuarios`)
              }
              sx={{ color: theme.palette.text.primary }}
              size="medium"
            >
              <VisibilityOutlined />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Editar">
              <IconButton
                onClick={() =>
                  navigate(`/admin/eventos/${params.row.id}/editar`)
                }
                sx={{ color: theme.palette.text.primary }}
                size="medium"
              >
                <EditNoteOutlined />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  // function onRowClick({ row }: GridRowParams) {
  //   navigate(`/admin/eventos/${row.id}/detalhes/usuarios`);
  // }

  return (
    <Card sx={cardTabelaSx}>
      <DataGrid
        loading={isLoading}
        //onRowClick={onRowClick}
        rows={filteredData}
        columns={columns}
        autoHeight={true}
        slots={{
          toolbar: GridToolbar,
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
    </Card>
  );
}

export { List };
