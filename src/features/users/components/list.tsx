import { Card } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  GridGetRowsToExportParams,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { formatDate, formatPhoneNumber } from '../../../utils';
import { useNavigate } from 'react-router-dom';
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
  const { data = [], isLoading } = useGetUsers({});
  const navigate = useNavigate();

  if (!Array.isArray(data)) {
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
  // Função para abrir o link em uma nova aba caso o Ctrl ou o Command (em Mac) esteja pressionado
  const handleRowClick = (params: any, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      const link = `${window.location.origin}/user/${params.row.id}/editar`;
      window.open(link, '_blank');
    }
  };
  return (
    <Card>
      <DataGrid
        rows={data}
        onRowClick={handleRowClick}
        onRowDoubleClick={(params) => {
          navigate(`/user/${params.row.id}/editar`);
        }}
        autoHeight={true}
        columns={columns}
        loading={isLoading}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[10, 25, 50, 100]}
        slotProps={{
          toolbar: {
            printOptions: { getRowsToExport: getSelectedRowsToExport },
          },
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Card>
  );
}
export { List };
