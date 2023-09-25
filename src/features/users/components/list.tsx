import { Card } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { formatPhoneNumber } from '../../../utils';
import { Button } from '@mui/material';
import PdfEvent from '../../../components/pdfEvent'
import FileSaver from "file-saver";
import { pdf } from "@react-pdf/renderer";
function List() {
  const { data = [] } = useGetUsers();

  async function handleDownloadPDF() {
    const blob = await pdf(<PdfEvent data={data} />).toBlob();
    FileSaver.saveAs(blob, "cursilho.pdf");
  }

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Nome', flex: 1 },
    {
      field: 'birthday',
      headerName: 'Data de nascimento',
      flex: 1,
      valueGetter: (params) =>
        new Date(params.row.birthday).toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
        }),
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
console.log(data)
  return (
    <Card>
      <Button variant="outlined" onClick={() =>{ 
        handleDownloadPDF();
      }}>
          Gerar PDF
     </Button>
     <DataGrid rows={data} autoHeight={true} columns={columns} />
    </Card>
  
  );
}

export { List };
