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
import { useGetNewsAdmin } from '../api/getNewsAdmin';
import { useDeleteNews } from '../api/deleteNews';
import { useResendNews } from '../api/resendNews';
import { useWhatsappConectado } from '../../settings/whatsapp/useWhatsappConectado';
import { News } from '../types';
import { dataDaNoticia, destinosDaNoticia } from '../utils';

function NewsAdminList({
  search,
  onEdit,
  churchId,
}: {
  search: string;
  onEdit: (news: News) => void;
  /** a igreja do seletor da tela: a lista é dela */
  churchId: string;
}) {
  const theme = useTheme();
  const { data, isLoading } = useGetNewsAdmin(churchId);
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
    if (!destinosDaNoticia(news).length) return 'Sem grupo marcado para envio';

    if (semNumero) {
      return 'WhatsApp desconectado — conecte um número em Configurações → Disparadores';
    }

    return 'Reenviar no WhatsApp';
  };

  // o reenvio vai para todos os grupos marcados, inclusive os que já
  // receberam: quem já viu a notícia vai vê-la de novo, e mensagem em grupo não
  // se desfaz — por isso a confirmação
  const confirmarReenvio = (news: News) => {
    const total = destinosDaNoticia(news).length;

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
      field: 'title',
      headerName: 'Notícia',
      flex: 2,
      minWidth: 220,
      cellClassName: 'celula-destaque',
      // a capa e o público entram aqui, e não em colunas próprias: a tabela
      // fica só com o que se olha para decidir — situação, data e WhatsApp
      renderCell: (params) => {
        const news = params.row as News;

        return (
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{ minWidth: 0 }}
          >
            {news.imageUrl ? (
              <Box
                component="img"
                src={news.imageUrl}
                alt=""
                sx={{
                  flexShrink: 0,
                  width: 52,
                  height: 34,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  flexShrink: 0,
                  width: 52,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageNotSupportedOutlined
                  sx={{ fontSize: 20, color: 'text.disabled' }}
                />
              </Box>
            )}
            <Stack sx={{ py: 0.5, minWidth: 0 }}>
              <Typography
                sx={{ fontSize: '0.9375rem', fontWeight: 500 }}
                noWrap
              >
                {params.value}
              </Typography>
              <Typography
                noWrap
                sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
              >
                {/* a igreja na frente: na visão "Todas as igrejas" a lista
                    mistura notícias de várias */}
                {[
                  news.church?.name,
                  news.event ? `Só: ${news.event.name}` : 'Todos os usuários',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </Stack>
          </Stack>
        );
      },
    },
    {
      field: 'isPublished',
      headerName: 'Situação',
      width: 120,
      renderCell: (params) => {
        // publicada sem data = agendada: entra no mural no primeiro horário
        const agendada = params.value && !(params.row as News).publishedAt;

        return (
          <Stack alignItems="flex-start" gap={0.25}>
            <CustomChip
              size="small"
              label={
                agendada ? 'Agendada' : params.value ? 'Publicada' : 'Rascunho'
              }
              customColor={
                agendada
                  ? theme.palette.chips.info
                  : params.value
                    ? theme.palette.chips.success
                    : theme.palette.chips.pending
              }
            />
            {/* a data de publicação vem junto da situação, e não numa coluna
                própria: as duas respondem "está no ar desde quando?" */}
            {(params.row as News).publishedAt && (
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {dataDaNoticia(params.row as News)}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      // um chip por disparador — por onde a notícia sai —, cada um com a
      // própria situação: o mural (sistema) e o WhatsApp
      field: 'disparadores',
      headerName: 'Disparadores',
      sortable: false,
      width: 200,
      renderCell: (params) => {
        const news = params.row as News;
        const noAr = !!news.isPublished && !!news.publishedAt;
        const destinos = destinosDaNoticia(news);

        const enviados = destinos.filter((destino) => destino.sentAt).length;
        const comErro = destinos.filter(
          (destino) => !destino.sentAt && destino.error
        );
        const tudoEnviado = enviados === destinos.length;

        return (
          <Stack direction="row" gap={0.75}>
            <Tooltip
              title={
                noAr
                  ? `No mural: ${
                      news.event
                        ? `só quem está em ${news.event.name}`
                        : 'todos os usuários'
                    }`
                  : 'Ainda não está no mural'
              }
            >
              <span>
                <CustomChip
                  size="small"
                  label="Mural"
                  customColor={
                    noAr
                      ? theme.palette.chips.success
                      : theme.palette.text.disabled
                  }
                />
              </span>
            </Tooltip>

            {destinos.length > 0 && (
              <Tooltip
                title={
                  comErro.length
                    ? comErro
                        .map((destino) => `${destino.nome}: ${destino.error}`)
                        .join(' | ')
                    : destinos.map((destino) => destino.nome).join(', ')
                }
              >
                <span>
                  <CustomChip
                    size="small"
                    label={`WhatsApp ${enviados}/${destinos.length}`}
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
            )}
          </Stack>
        );
      },
    },
    {
      field: 'acoes',
      headerName: '',
      sortable: false,
      width: 124,
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
                  !destinosDaNoticia(params.row as News).length
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
