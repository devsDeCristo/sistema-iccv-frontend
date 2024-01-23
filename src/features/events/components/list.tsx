import { Card } from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../api/getEvents';
import { formatDate } from '../../../utils';

function List() {
  const navigate = useNavigate();

  const { data = [], isLoading } = useGetEvents({});

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    {
      field: 'startDate',
      headerName: 'Data inicial',
      flex: 1,
      valueGetter: (params) => formatDate(params.row.startDate),
    },
    {
      field: 'endDate',
      headerName: 'Data final',
      flex: 1,
      valueGetter: (params) => formatDate(params.row.endDate),
    },
    { field: 'price', headerName: 'Preço', flex: 1 },
  ];

  function onRowClick({ row }: GridRowParams) {
    navigate(`/eventos/${row.id}/detalhes`);
  }

  return (
    <Card>
      <DataGrid
        loading={isLoading}
        onRowClick={onRowClick}
        rows={Array.isArray(data) ? data : []}
        columns={columns}
      />
    </Card>
  );
}

export { List };
