import {
  Card,
  Chip,
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

const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);

  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};
function List({ search }: { search: string }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: eventData, isLoading } = useGetEvents({});
  const events = Array.isArray(eventData) ? eventData : [];
  const filteredData = events.filter((event: any) => {
    const searchLower = search.toLowerCase();
    return event.name.toLowerCase().includes(searchLower);
  });
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
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
      renderCell: (params) => <Chip label={params.value || 'Cursilho'} />,
    },
    {
      field: 'capacity',
      headerName: 'Cursilhistas',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const participantsCount = params.row.users.filter(
          (user: any) => !user.worker
        ).length;
        return (
          <Stack direction="row" alignItems="center">
            <Typography>
              {participantsCount}/{params.row.capacity}
              <LinearProgress
                variant="determinate"
                value={(participantsCount / params.row.capacity) * 100}
              />
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'capacityWorker',
      headerName: 'Cursilheiros',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const participantsCount = params.row.users.filter(
          (user: any) => user.worker
        ).length;
        return (
          <Stack direction="row" alignItems="center">
            <Typography>
              {participantsCount}/{params.row.capacityWorker}
              <LinearProgress
                variant="determinate"
                value={(participantsCount / params.row.capacityWorker) * 100}
              />
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
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Ativo' : 'Inativo'}
          color={params.value ? 'success' : 'default'}
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
          <Tooltip title="Editar">
            <IconButton
              onClick={() => navigate(`/admin/eventos/${params.row.id}/editar`)}
              sx={{ color: theme.palette.text.primary }}
              size="medium"
            >
              <EditNoteOutlined />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  // function onRowClick({ row }: GridRowParams) {
  //   navigate(`/admin/eventos/${row.id}/detalhes/usuarios`);
  // }

  return (
    <Card>
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
        }}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      />
    </Card>
  );
}

export { List };
