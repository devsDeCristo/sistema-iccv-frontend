import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbar,
  ptBR,
} from '@mui/x-data-grid';
import {
  FactCheckOutlined,
  MoreVert,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import CustomChip from '../../../../components/customChip';
import { BarraDeSelecao } from '../../../../components/barraDeSelecao';
import {
  cardTabelaSx,
  dataGridSx,
} from '../../../../components/listPageStyles';
import { baixarPdfNaFila } from '../../../../utils/pdfNaFila';
import {
  LinhaDaPresenca,
  useGetCertificado,
  useGetPresenca,
} from '../api/certificado';

/** Os três pontinhos da linha, como na lista de eventos */
function AcoesDaLinha({
  nome,
  desligado,
  onBaixar,
}: {
  nome: string;
  desligado: boolean;
  onBaixar: () => void;
}) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title="Ações">
        <IconButton
          aria-label={`Ações de ${nome}`}
          onClick={(evento) => setAncora(evento.currentTarget)}
        >
          <MoreVert />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={ancora}
        open={!!ancora}
        onClose={() => setAncora(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          disabled={desligado}
          onClick={() => {
            setAncora(null);
            onBaixar();
          }}
        >
          <ListItemIcon sx={{ color: 'primary.main', minWidth: 34 }}>
            <WorkspacePremiumOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
            Baixar certificado
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

/**
 * A aba "Presença e certificados" do evento: todos os inscritos, com o grupo e
 * a hora de chegada de quem fez check-in.
 *
 * Cada presente tem nos três pontinhos o certificado dele, e as caixas marcam
 * vários para gerar de uma vez — como na lista de usuários, a barra flutuante
 * mostra quantos e o que fazer com eles. Ausente não tem caixa nem menu: não
 * tem direito ao certificado.
 *
 * Se o evento emite certificado, e quem assina, é do cadastro do evento
 * (etapa Módulos). Desligado, a lista avisa e leva para a edição.
 */
export function ListaDePresenca({ eventId }: { eventId: string }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));
  const { data, isLoading } = useGetPresenca(eventId);
  const { data: certificado } = useGetCertificado(eventId);
  const ligado = !!certificado?.enabled;
  const linhas = data ?? [];
  const [selecionados, setSelecionados] = useState<GridRowSelectionModel>([]);
  /** o `userId` que está gerando, ou "marcados" */
  const [gerando, setGerando] = useState<string | null>(null);

  const presentes = linhas.filter((l) => l.chegada).length;

  const gerar = async (userIds: string[], quem: string) => {
    setGerando(quem);
    await baixarPdfNaFila(
      `/events/${eventId}/certificates/pdf`,
      'certificados.pdf',
      { userIds }
    );
    setGerando(null);
  };

  const columns: GridColDef<LinhaDaPresenca>[] = [
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 2,
      minWidth: celular ? 130 : 200,
    },
    { field: 'grupo', headerName: 'Grupo', flex: 1, minWidth: 140 },
    {
      field: 'chegada',
      headerName: 'Presença',
      width: celular ? 100 : 210,
      valueGetter: (params) =>
        params.row.chegada ? `Presente · ${params.row.chegada}` : 'Ausente',
      renderCell: (params) => (
        <CustomChip
          size="small"
          // no celular a hora sai, para a linha caber sem rolar de lado
          label={celular ? params.value.split(' · ')[0] : params.value}
          customColor={
            params.row.chegada
              ? theme.palette.chips.success
              : theme.palette.chips.canceled
          }
        />
      ),
    },
    {
      field: 'acoes',
      headerName: '',
      width: 56,
      align: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableExport: true,
      renderCell: (params) =>
        params.row.chegada && (
          <AcoesDaLinha
            nome={params.row.nome}
            desligado={!ligado || gerando !== null}
            onBaixar={() => gerar([params.row.userId], params.row.userId)}
          />
        ),
    },
  ];

  return (
    <Card
      sx={{
        ...cardTabelaSx,
        // o respiro abaixo das abas é do conteúdo, como nas outras abas
        mt: 2,
        // o lugar da barra flutuante no fim da página — ver a lista de eventos
        mb: selecionados.length ? { xs: 5.5, sm: 6.5 } : 0,
      }}
    >
      <Stack
        direction="row"
        gap={1.5}
        alignItems="center"
        sx={{ p: { xs: 2, sm: 2.5 }, pb: { xs: 0.5, sm: 0.5 } }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            color: theme.palette.chips.success,
            bgcolor: alpha(theme.palette.chips.success, 0.12),
          }}
        >
          <FactCheckOutlined />
        </Box>
        <Box>
          <Typography variant="h6" fontSize={18}>
            Lista de presença
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLoading
              ? 'Carregando…'
              : `${presentes} de ${linhas.length} inscritos fizeram check-in.`}
          </Typography>
        </Box>
      </Stack>

      {certificado && !ligado && (
        <Alert
          severity="info"
          sx={{ mx: { xs: 2, sm: 2.5 }, mt: 1.5, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/admin/eventos/${eventId}/editar`)}
            >
              Editar evento
            </Button>
          }
        >
          Este evento não emite certificado. Para ligar, e definir quem assina,
          edite o evento na etapa Módulos.
        </Alert>
      )}

      <BarraDeSelecao
        quantos={selecionados.length}
        rotuloDaRegiao="Inscritos selecionados"
        // desligado, a barra só conta e limpa: o aviso acima diz o porquê
        acao={
          ligado
            ? {
                rotulo:
                  gerando === 'marcados' ? 'Gerando…' : 'Baixar certificados',
                rotuloCurto:
                  gerando === 'marcados' ? 'Gerando…' : 'Certificados',
                icone: <WorkspacePremiumOutlined />,
                onClick: () => {
                  if (gerando === null) {
                    gerar(selecionados.map(String), 'marcados');
                  }
                },
              }
            : undefined
        }
        onLimpar={() => setSelecionados([])}
      />
      <DataGrid
        loading={isLoading}
        rows={linhas}
        getRowId={(linha) => linha.userId}
        columns={columns}
        checkboxSelection
        isRowSelectable={(params) => !!params.row.chegada}
        disableRowSelectionOnClick
        rowSelectionModel={selecionados}
        onRowSelectionModelChange={setSelecionados}
        // busca e filtro escondem linhas, mas não desmarcam quem foi marcado
        keepNonExistentRowsSelected
        hideFooterSelectedRowCount
        autoHeight
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
          // no celular o grupo sai, para a presença caber sem rolar de lado
          columns: { columnVisibilityModel: { grupo: !celular } },
        }}
        slots={{ toolbar: GridToolbar }}
        columnHeaderHeight={44}
        sx={dataGridSx(theme)}
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
      />
    </Card>
  );
}
