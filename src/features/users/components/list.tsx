import { Card } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { Button } from '@mui/material';
import PdfEvent from '../../../components/pdfEvent';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import { formatDate, formatPhoneNumber } from '../../../utils';
import { User } from '../../../types/user';
import { useNavigate } from 'react-router-dom';

function List() {
  const { data = [], isLoading } = useGetUsers({});
  const navigate = useNavigate();

  if (!Array.isArray(data)) {
    return null;
  }

  async function handleDownloadPDF(data: User[]) {
    const blob = await pdf(
      <PdfEvent
        data={data}
        textFooter={'28 de setembro a 01 de outubro de 2023'}
      />
    ).toBlob();
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
    <>
      <Card>
        <Button
          variant="outlined"
          onClick={() => {
            handleDownloadPDF(data as unknown as User[]);
          }}
        >
          Gerar PDF
        </Button>
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
      </Card>{' '}
      {/* <PDFViewer width={'100%'} height={'100%'}>
        <PdfEvent
          data={data}
          textFooter={'28 de setembro a 01 de outubro de 2023'}
        />
      </PDFViewer> */}
    </>
  );
}
export { List };
