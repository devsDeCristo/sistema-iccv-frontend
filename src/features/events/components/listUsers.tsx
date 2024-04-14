import { Card } from '@mui/material';
import { formatDate } from '../../../utils';
import {
  DataGrid,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useGetEvents } from '../api/getEvents';
import { useParams } from 'react-router-dom';
const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);
  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};
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
      field: 'worker',
      headerName: 'Trabalhar',
      flex: 1,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
    { field: 'neighborhood', headerName: 'Bairro', flex: 1 },
    { field: 'city', headerName: 'Cidade', flex: 1 },
    { field: 'leadershipPosition', headerName: 'Cargo na igreja', flex: 1 },
    {
      field: 'hypertensive',
      headerName: 'Hipertenso',
      flex: 1,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
    {
      field: 'diabetes',
      headerName: 'Diabético',
      flex: 1,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
    { field: 'notes', headerName: 'Observações', flex: 1 },
    {
      field: 'paid',
      headerName: 'Pago',
      flex: 1,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
  ];

  return (
    <Card>
      <DataGrid
        rows={eventData.users || []}
        columns={columns}
        loading={isLoading}
        autoHeight={true}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            printOptions: { getRowsToExport: getSelectedRowsToExport },
          },
        }}
      />
    </Card>
  );
}

export { ListUsers };
