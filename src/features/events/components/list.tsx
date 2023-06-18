import { Card } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

function List() {
  const navigate = useNavigate();
  const rows: GridRowsProp = [
    {
      id: 1,
      name: 'Felipe',
      startDate: '20/09/2023',
      endDate: '23/09/2023',
      price: 200,
    },
    {
      id: 2,
      name: 'Felipe Q',
      startDate: '20/09/2023',
      endDate: '23/09/2023',
      price: 200,
    },
    {
      id: 3,
      name: 'Felipe C',
      startDate: '20/09/2023',
      endDate: '23/09/2023',
      price: 200,
    },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'startDate', headerName: 'Data inicial', flex: 1 },
    { field: 'endDate', headerName: 'Data final', flex: 1 },
    { field: 'price', headerName: 'Preço', flex: 1 },
  ];

  function onRowClick({ row }: GridRowParams) {
    navigate(`/eventos/${row.id}/detalhes`);
  }

  return (
    <Card>
      <DataGrid onRowClick={onRowClick} rows={rows} columns={columns} />
    </Card>
  );
}

export { List };
