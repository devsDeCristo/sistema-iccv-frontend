import { Card } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useGetUsers } from '../api/getUsers';
import { Button } from '@mui/material';
import PdfEvent from '../../../components/pdfEvent';
import FileSaver from 'file-saver';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { formatDate, formatPhoneNumber } from '../../../utils';

function List() {
  //const { data = [], isLoading } = useGetUsers();

  async function handleDownloadPDF() {
    const blob = await pdf(
      <PdfEvent
        data={users}
        textFooter={'6° CURSILHO MASCULINO DE CRISTANDADE'}
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
            handleDownloadPDF();
          }}
        >
          Gerar PDF
        </Button>
        <DataGrid
          rows={users}
          autoHeight={true}
          columns={columns}
          loading={false}
        />
      </Card>{' '}
      <PDFViewer width={'100%'} height={'100%'}>
        <PdfEvent
          data={users}
          textFooter={'28 de setembro a 01 de outubro de 2023'}
        />
      </PDFViewer>
    </>
  );
}

const users = [
  {
    id: 5,
    email: 'edudamaris33@gmail.com',
    fullName: 'Eduarda Dâmaris Lima Diógenes',
    cpf: '70025784480',
    birthday: '2004-06-09T00:00:00.000Z',
    cellphone: '84994669886',
    worker: false,
    diabetes: false,
    hypertensive: false,
    profession: 'Cursilhista',
    city: 'Parnamirim',
    state: 'RN',
    role: 5,
    profilePhotoUrl:
      'https://firebasestorage.googleapis.com/v0/b/igrejadecristo-daed7.appspot.com/o/Screenshot from 2023-09-09 19-23-32.png?alt=media',
    emergencyContact: null,
    indicatedBy: null,
    leadershipPosition: null,
    religion: null,
    notes: null,
    createdAt: '2023-09-24T19:18:57.540Z',
    updateAt: '2023-09-24T19:17:35.946Z',
  },
  {
    id: 22,
    email: '',
    fullName: 'Ericka Karrolinne',
    cpf: '15334822410',
    birthday: '2004-03-22T00:00:00.000Z',
    cellphone: '84999348788',
    worker: false,
    diabetes: false,
    hypertensive: false,
    profession: 'Cursilhista',
    city: 'Natal',
    state: 'RN',
    role: 5,
    profilePhotoUrl:
      'https://firebasestorage.googleapis.com/v0/b/igrejadecristo-daed7.appspot.com/o/Screenshot from 2023-09-09 19-23-32.png?alt=media',
    emergencyContact: '84987247979',
    indicatedBy: null,
    leadershipPosition: null,
    religion: 'Evangelica',
    notes: null,
    createdAt: '2023-09-24T20:07:30.343Z',
    updateAt: '2023-09-24T20:10:14.598Z',
  },
];
export { List };
