import { Box, Card, IconButton, Tooltip } from '@mui/material';
import { formatDate } from '../../../utils';
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridGetRowsToExportParams,
  GridRowId,
  GridToolbar,
  gridFilteredSortedRowIdsSelector,
  selectedGridRowsSelector,
} from '@mui/x-data-grid';
import { useGetEvents } from '../api/getEvents';
import { useParams } from 'react-router-dom';
import { Badge, Delete } from '@mui/icons-material';
import FileSaver from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import PdfBadge from '../../../components/pdfBadge';
import { User } from '../../../types/user';
import Swal from 'sweetalert2';
import { useRemoveUserFromEvent } from '../api/deleteUser';
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

  const { mutate: mutateRemoveUserFromEvent } = useRemoveUserFromEvent({
    onSuccess: () => {
      Swal.fire({
        title: 'Desvinculado!',
        text: 'Usuário desvinculado do evento com sucesso.',
        icon: 'success',
      });
    },
    onError: () => {
      Swal.fire({
        title: 'Erro ao remover usuário do evento',
        text: 'Ocorreu um erro ao tentar desvincular o usuário do evento. Por favor, tente novamente mais tarde.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    },
  });

  if (!eventData || Array.isArray(eventData)) {
    return null;
  }
  async function handleDownloadPDF(data: User[]) {
    if (!eventData || Array.isArray(eventData)) {
      return null;
    }
    const blob = await pdf(<PdfBadge data={data || []} />).toBlob();
    FileSaver.saveAs(blob, 'crachas.pdf');
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
      field: 'worker',
      headerName: 'Trabalhar',
      flex: 1,
      valueGetter: (params) => (params.row.worker ? 'Sim' : 'Não'),
    },
    { field: 'neighborhood', headerName: 'Bairro', flex: 1 },
    { field: 'city', headerName: 'Cidade', flex: 1 },
    { field: 'leadershipPosition', headerName: 'Cargo na igreja', flex: 1 },
    {
      field: 'hypertensive',
      headerName: 'Hipertenso',
      flex: 1,
      valueGetter: (params) => (params.row.hypertensive ? 'Sim' : 'Não'),
    },
    {
      field: 'diabetes',
      headerName: 'Diabético',
      flex: 1,
      valueGetter: (params) => (params.row.diabetes ? 'Sim' : 'Não'),
    },
    { field: 'notes', headerName: 'Observações', flex: 1 },
    {
      field: 'badgeName',
      headerName: 'Nome do crachá',
      flex: 1,
    },
    {
      field: 'cellphone',
      headerName: 'Telefone',
      flex: 1,
    },
    {
      field: 'cpf',
      headerName: 'CPF',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'E-mail',
      flex: 1,
    },
    {
      field: 'emergencyContact',
      headerName: 'Contato de emergência',
      flex: 1,
    },
    {
      field: 'indicatedBy',
      headerName: 'Indicado por',
      flex: 1,
    },
    {
      field: 'religion',
      headerName: 'Religião',
      flex: 1,
    },
    {
      field: 'profession',
      headerName: 'Profissão',
      flex: 1,
    },
    {
      field: 'createdAt',
      headerName: 'Data da inscrição',
      flex: 1,
      valueGetter: (params) => formatDate(params.row.createdAt),
    },
    {
      field: 'paid',
      headerName: 'Pago',
      flex: 1,
      valueGetter: (params) => (params.row.paid ? 'Sim' : 'Não'),
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 80,
      //flex: 1,
      renderCell: (params: GridCellParams) => {
        const onClick = () => {
          handleDownloadPDF([params.row]);
        };

        const onClickRemove = () => {
          Swal.fire({
            title: 'Tem certeza que deseja desvincular o usuário do evento?',
            text: 'Esta ação não poderá ser desfeita!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, desvincular do evento!',
          }).then((result) => {
            if (result.isConfirmed) {
              mutateRemoveUserFromEvent({
                idEvent: eventId,
                idUser: params.row.id.toString(),
              });
            }
          });
        };

        return (
          <Box key={params.id}>
            <Tooltip
              title={'Baixar crachá'}
              id="basic-button"
              onClick={onClick}
            >
              <IconButton size="small">
                <Badge color="primary" />
              </IconButton>
            </Tooltip>

            <Tooltip
              title="Remover usuário do evento"
              id="button-remove-user"
              onClick={onClickRemove}
            >
              <IconButton size="small">
                <Delete color="primary" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
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
        initialState={{
          columns: {
            columnVisibilityModel: {
              profession: false,
              religion: false,
              indicatedBy: false,
              emergencyContact: false,
              email: false,
              cpf: false,
              cellphone: false,
              badgeName: false,
              diabetes: false,
              hypertensive: false,
              notes: false,
              leadershipPosition: false,
              createdAt: false,
            },
          },
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
