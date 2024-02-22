import { Card } from '@mui/material';
import { formatDate, formatPhoneNumber } from '../../../utils';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetEvents } from '../api/getEvents';
import { useParams } from 'react-router-dom';

function ListUsers() {
  const { id: eventId = '' } = useParams();
  const { data: eventData, isLoading } = useGetEvents(
    {
      eventId: eventId,
    },
    {
      enabled: !!eventId,
    }
  );

  if (!eventData || Array.isArray(eventData)) {
    return null;
  }

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Nome', flex: 1 },
    {
      field: 'birthday',
      headerName: 'Data de nascimento',
      flex: 1,
      valueGetter: (params) => formatDate(params.row.birthday),
    },
    {
      field: 'cellphone',
      headerName: 'Telefone',
      flex: 1,
      valueGetter: (params) => formatPhoneNumber(params.row.cellphone),
    },
    { field: 'religion', headerName: 'Religião', flex: 1 },
    { field: 'notes', headerName: 'Observações', flex: 1 },
  ];

  return (
    <Card>
      <DataGrid
        rows={eventData.users || []}
        columns={columns}
        loading={isLoading}
      />
    </Card>
  );
}

export { ListUsers };
