import { Card } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridRowParams,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useGetEvents } from '../api/getEvents';
import { formatDate } from '../../../utils';

const getSelectedRowsToExport = ({
  apiRef,
}: GridGetRowsToExportParams): GridRowId[] => {
  const selectedRowIds = selectedGridRowsSelector(apiRef);
  if (selectedRowIds.size > 0) {
    return Array.from(selectedRowIds.keys());
  }

  return gridFilteredSortedRowIdsSelector(apiRef);
};
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
    navigate(`/eventos/${row.id}/detalhes/quartos`);
  }

  return (
    <Card>
      <DataGrid
        loading={isLoading}
        onRowClick={onRowClick}
        rows={Array.isArray(data) ? data : []}
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
      />
    </Card>
  );
}

export { List };
