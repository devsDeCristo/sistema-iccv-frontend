import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar, ptBR } from '@mui/x-data-grid';
import {
  Delete,
  EditOutlined,
  WhatsApp,
  ImageNotSupportedOutlined,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import CustomChip from '../../../components/customChip';
import { cardTabelaSx, dataGridSx } from '../../../components/listPageStyles';
import { formatDateTime } from '../../../utils';
import { useGetNewsAdmin } from '../api/getNewsAdmin';
import { useDeleteNews } from '../api/deleteNews';
import { useResendNews } from '../api/resendNews';
import { useWhatsappConectado } from '../../settings/whatsapp/useWhatsappConectado';
import { News } from '../types';
import { dataDaNoticia } from '../utils';

function NewsAdminList({
  search,
  onEdit,
}: {
  search: string;
  onEdit: (news: News) => void;
}) {
  const theme = useTheme();
  const { data, isLoading } = useGetNewsAdmin();
  const { semNumero } = useWhatsappConectado();
  const { mutate: reenviar, isLoading: reenviando } = useResendNews();

  const { mutate: excluir } = useDeleteNews({
    onSuccess: () =>
      Swal.fire({
        title: 'Excluída!',
        text: 'A notícia foi removida.',
        icon: 'success',
      }),
  });

  // sem número conectado o disparo só gravaria falha em cada destino; o botão
  // fica de fora, e o porquê vai no tooltip para não virar botão morto
  const motivoDoReenvio = (news: News) => {
    if (!news.groups?.length) return 'Sem grupo marcado para envio';

    if (semNumero) {
      return 'WhatsApp desconectado — conecte um número em Configurações → Disparadores';
    }

    return 'Reenviar no WhatsApp';
  };

  // o reenvio vai para todos os grupos marcados, inclusive os que já
  // receberam: quem já viu a notícia vai vê-la de novo, e mensagem em grupo não
  // se desfaz — por isso a confirmação
  const confirmarReenvio = (news: News) => {
    const total = news.groups?.length || 0;

    Swal.fire({
      title: 'Reenviar no WhatsApp?',
      text:
        `"${news.title}" será enviada de novo para ${total} grupo(s), ` +
        'com o texto e a imagem atuais. Quem já recebeu vai receber outra vez.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, reenviar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = '2000';
      },
    }).then((resultado) => {
      if (resultado.isConfirmed) reenviar(news.id);
    });
  };

  const confirmarExclusao = (news: News) => {
    Swal.fire({
      title: 'Excluir notícia?',
      text: `"${news.title}" sai do feed e não pode ser recuperada.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = '2000';
      },
    }).then((resultado) => {
      if (resultado.isConfirmed) excluir(news.id);
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: '',
      sortable: false,
      width: 72,
      renderCell: (params) =>
        params.value ? (
          <Box
            component="img"
            src={params.value as string}
            alt=""
            sx={{ width: 52, height: 34, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : (
          <ImageNotSupportedOutlined
            sx={{ fontSize: 20, color: 'text.disabled' }}
          />
        ),
    },
    {
      field: 'title',
      headerName: 'Notícia',
      flex: 2,
      minWidth: 240,
      cellClassName: 'celula-destaque',
      renderCell: (params) => (
        <Stack sx={{ py: 0.5, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500 }} noWrap>
            {params.value}
          </Typography>
          {params.row.summary && (
            <Typography
              noWrap
              sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
            >
              {params.row.summary}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      field: 'isPublished',
      headerName: 'Situação',
      width: 130,
      renderCell: (params) => (
        <CustomChip
          size="small"
          label={params.value ? 'Publicada' : 'Rascunho'}
          customColor={
            params.value
              ? theme.palette.chips.success
              : theme.palette.chips.pending
          }
        />
      ),
    },
    {
      // quem enxerga o anúncio no mural. Sem evento é aviso geral — o padrão
      field: 'event',
      headerName: 'Público',
      sortable: false,
      width: 190,
      renderCell: (params) => {
        const evento = (params.row as News).event;

        return (
          <Tooltip
            title={
              evento
                ? `Só quem está em ${evento.name} — inscritos e lista de espera`
                : 'Todos os usuários'
            }
          >
            <span>
              <CustomChip
                size="small"
                label={evento ? evento.name : 'Todos'}
                customColor={
                  evento
                    ? theme.palette.chips.pending
                    : theme.palette.chips.success
                }
              />
            </span>
          </Tooltip>
        );
      },
    },
    {
      // `dateTime` com valor de Date, e não a string já formatada: senão a
      // coluna ordenaria em ordem alfabética de "Hoje, 19:08"
      field: 'publishedAt',
      headerName: 'Publicada em',
      type: 'dateTime',
      width: 160,
      cellClassName: 'celula-numerica',
      valueGetter: (params) =>
        params.row.publishedAt ? new Date(params.row.publishedAt) : null,
      valueFormatter: (params) =>
        params.value
          ? dataDaNoticia({
              publishedAt: params.value,
              createdAt: params.value,
            })
          : '—',
    },
    {
      field: 'author',
      headerName: 'Autor',
      width: 180,
      valueGetter: (params) => params.row.author?.fullName || '—',
    },
    {
      field: 'updatedAt',
      headerName: 'Última alteração',
      type: 'dateTime',
      width: 170,
      cellClassName: 'celula-numerica',
      valueGetter: (params) =>
        params.row.updatedAt ? new Date(params.row.updatedAt) : null,
      valueFormatter: (params) =>
        params.value ? formatDateTime(params.value) : '—',
    },
    {
      field: 'whatsapp',
      headerName: 'WhatsApp',
      sortable: false,
      width: 150,
      renderCell: (params) => {
        const destinos = (params.row as News).groups ?? [];

        if (!destinos.length) {
          return (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              —
            </Typography>
          );
        }

        const enviados = destinos.filter((destino) => destino.sentAt).length;
        const comErro = destinos.filter(
          (destino) => !destino.sentAt && destino.error
        );
        const tudoEnviado = enviados === destinos.length;

        return (
          <Tooltip
            title={
              comErro.length
                ? comErro
                    .map(
                      (destino) =>
                        `${destino.groupRole.event.name} / ${destino.groupRole.name}: ${destino.error}`
                    )
                    .join(' | ')
                : destinos
                    .map(
                      (destino) =>
                        `${destino.groupRole.event.name} / ${destino.groupRole.name}`
                    )
                    .join(', ')
            }
          >
            <span>
              <CustomChip
                size="small"
                label={
                  tudoEnviado
                    ? `Enviado (${enviados})`
                    : `${enviados}/${destinos.length}`
                }
                customColor={
                  tudoEnviado
                    ? theme.palette.chips.success
                    : comErro.length
                    ? theme.palette.chips.canceled
                    : theme.palette.chips.pending
                }
              />
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: 'acoes',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" gap={0.5}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(params.row as News)}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={motivoDoReenvio(params.row as News)}>
            <span>
              <IconButton
                size="small"
                disabled={
                  reenviando ||
                  semNumero ||
                  !(params.row as News).groups?.length
                }
                onClick={() => confirmarReenvio(params.row as News)}
              >
                <WhatsApp fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              color="error"
              onClick={() => confirmarExclusao(params.row as News)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const busca = search.trim().toLowerCase();
  const linhas = (Array.isArray(data) ? data : []).filter(
    (news) =>
      !busca ||
      news.title.toLowerCase().includes(busca) ||
      (news.summary || '').toLowerCase().includes(busca)
  );

  return (
    <Card elevation={0} sx={cardTabelaSx}>
      <DataGrid
        rows={linhas}
        columns={columns}
        loading={isLoading}
        autoHeight
        rowHeight={56}
        columnHeaderHeight={44}
        slots={{ toolbar: GridToolbar }}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        sx={dataGridSx(theme)}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      />
    </Card>
  );
}

export { NewsAdminList };
