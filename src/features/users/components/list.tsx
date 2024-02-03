import { Card } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { formatDate, formatPhoneNumber } from '../../../utils';
import { useNavigate } from 'react-router-dom';

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

  return (
    <Card>
      <DataGrid
        rows={data}
        onRowDoubleClick={(params) => {
          navigate(`/user/${params.row.id}/editar`);
        }}
        autoHeight={true}
        columns={columns}
        loading={isLoading}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
      />
    </Card>
  );
}
export { List };
