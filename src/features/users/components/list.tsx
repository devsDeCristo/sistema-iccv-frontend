import { Card } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { Button } from '@mui/material';
import PdfEvent from '../../../components/pdfEvent';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { formatDate, formatPhoneNumber } from '../../../utils';

function List() {
  const { data = [], isLoading } = useGetUsers();

  async function handleDownloadPDF() {
    const blob = await pdf(<PdfEvent data={data} />).toBlob();
    FileSaver.saveAs(blob, 'cursilho.pdf');
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
      <Button
        variant="outlined"
        onClick={() => {
          handleDownloadPDF();
        }}
      >
        Gerar PDF
      </Button>
      <DataGrid
        rows={data}
        autoHeight={true}
        columns={columns}
        loading={isLoading}
      />
    </Card>
  );
}

export { List };
