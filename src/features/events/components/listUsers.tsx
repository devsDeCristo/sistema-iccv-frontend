import { Card } from '@mui/material';
import { formatDate, formatPhoneNumber } from '../../../utils';
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
