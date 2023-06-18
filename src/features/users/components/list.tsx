import { Box, Card } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';

function List() {
  const rows: GridRowsProp = [
    {
      id: 1,
      name: 'Felipe',
      birthday: '20/11/1993',
      cellphone: '84 987945555',
      religion: 'Protestante',
      notes: 'Alergico a danone',
    },
    {
      id: 2,
      name: 'Felipe Q',
      birthday: '20/11/1993',
      cellphone: '84 987945555',
      religion: 'Protestante',
      notes: 'Alergico a danone',
    },
    {
      id: 3,
      name: 'Felipe C',
      birthday: '20/11/1993',
      cellphone: '84 987945555',
      religion: 'Protestante',
      notes: 'Alergico a danone',
    },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'birthday', headerName: 'Data de nascimento', flex: 1 },
    { field: 'cellphone', headerName: 'Telefone', flex: 1 },
    { field: 'religion', headerName: 'Religião', flex: 1 },
    { field: 'notes', headerName: 'Observações', flex: 1 },
  ];

  return (
    <Card>
      <DataGrid rows={rows} columns={columns} />
    </Card>
  );
}

export { List };
