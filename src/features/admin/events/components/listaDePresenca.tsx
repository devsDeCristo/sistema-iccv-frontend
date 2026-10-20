import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
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
  MoreVert,
  Search,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import CustomChip from '../../../../components/customChip';
import { BarraDeSelecao } from '../../../../components/barraDeSelecao';
import { UserAvatar } from '../../../../components/userAvatar';
import {
  barraLarguraCheiaNoCelularSx,
  cardTabelaSx,
  dataGridSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { baixarPdfNaFila } from '../../../../utils/pdfNaFila';
import {
  LinhaDaPresenca,
  useGetCertificado,
  useGetPresenca,
} from '../api/certificado';
import { propsDeSelectDeFiltro } from '../../../../components/filtroDeLista';

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
 * A situação do certificado, na barra de busca: um selo discreto, e não um
 * alerta — desligado é uma escolha do evento, não um problema. Ligado, diz a
 * carga horária e onde baixar; desligado, leva para a edição do evento.
 */
function SituacaoDoCertificado({
  ligado,
  cargaHoraria,
  onLigar,
}: {
  ligado: boolean;
  cargaHoraria: string | null;
  onLigar: () => void;
}) {
  const theme = useTheme();
  const cor = ligado ? theme.palette.chips.info : theme.palette.text.disabled;

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.25}
      sx={{
        ml: { sm: 'auto' },
        width: { xs: '100%', sm: 'auto' },
        minWidth: 0,
        // a altura dos campos `small` da barra, para os três alinharem
        height: 40,
        pl: 0.75,
        pr: ligado ? 2 : 0.75,
        borderRadius: 2.5,
        border: `1px ${ligado ? 'solid' : 'dashed'} ${
          ligado ? alpha(cor, 0.35) : theme.palette.divider
        }`,
        bgcolor: ligado ? alpha(cor, 0.06) : 'transparent',
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          color: cor,
          bgcolor: alpha(cor, ligado ? 0.14 : 0.08),
        }}
      >
        <WorkspacePremiumOutlined sx={{ fontSize: 17 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontSize={13} fontWeight={600} lineHeight={1.25} noWrap>
          {ligado
            ? `Certificado ligado${cargaHoraria ? ` · ${cargaHoraria}` : ''}`
            : 'Certificado desligado'}
        </Typography>
        <Typography
          fontSize={12}
          color="text.secondary"
          lineHeight={1.25}
          noWrap
        >
          {ligado
            ? 'Baixe nos três pontinhos ou marque vários'
            : 'Este evento não emite certificado'}
        </Typography>
      </Box>
      {!ligado && (
        <Button
          size="small"
          onClick={onLigar}
          sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 600 }}
        >
          Ligar
        </Button>
      )}
    </Stack>
  );
}

/**
 * A aba "Presença e certificados" do evento, no formato das outras abas com
 * lista: barra de busca e a tabela — todos os inscritos, com o grupo e a hora
 * de chegada de quem fez check-in.
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
  const [busca, setBusca] = useState('');
  const [presenca, setPresenca] = useState<'' | 'presentes' | 'ausentes'>('');
  const [selecionados, setSelecionados] = useState<GridRowSelectionModel>([]);
  /** o `userId` que está gerando, ou "marcados" */
  const [gerando, setGerando] = useState<string | null>(null);

  const termo = busca.trim().toLowerCase();
  const visiveis = linhas.filter(
    (l) =>
      (!termo ||
        l.nome.toLowerCase().includes(termo) ||
        !!l.nomeNoCracha?.toLowerCase().includes(termo)) &&
      (!presenca || (presenca === 'presentes') === !!l.chegada)
  );

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
      // a foto, como na lista de inscritos
      field: 'foto',
      headerName: '',
      // no celular as colunas apertam para a linha caber sem rolar de lado
      width: celular ? 48 : 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      disableExport: true,
      renderCell: (params) => (
        <UserAvatar
          name={params.row.nome}
          photoUrl={params.row.foto}
          sx={{ width: '30px', height: '30px' }}
        />
      ),
    },
    {
      // o padrão da lista de inscritos: o nome e, embaixo, o do crachá
      field: 'nome',
      headerName: 'Nome/Crachá',
      flex: 2,
      minWidth: celular ? 110 : 200,
      renderCell: (params) => (
        <Stack sx={{ py: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {params.row.nome}
          </Typography>
          {params.row.nomeNoCracha && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.nomeNoCracha}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      // o tipo em cima e o grupo embaixo, como nascimento e idade na lista de
      // inscritos; a exportação leva os dois juntos
      field: 'tipo',
      headerName: 'Inscrição',
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => `${params.row.tipo} (${params.row.grupo})`,
      renderCell: (params) => (
        <Stack sx={{ py: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {params.row.tipo}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.grupo}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'chegada',
      headerName: 'Presença',
      width: celular ? 90 : 210,
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
    <Stack
      gap={2}
      sx={{
        mt: 2,
        // o lugar da barra flutuante no fim da página — ver a lista de eventos
        mb: selecionados.length ? { xs: 5.5, sm: 6.5 } : 0,
      }}
    >
      {/* a barra de busca das outras abas; a situação do certificado divide
          a linha com ela, à direita, e desce para baixo no celular */}
      <Paper
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          p: 2,
          ...superficieSx,
          ...barraLarguraCheiaNoCelularSx,
        }}
      >
        <TextField
          placeholder="Pesquisar por nome ou crachá"
          variant="outlined"
          size="small"
          value={busca}
          sx={{ width: { xs: '100%', sm: '350px' } }}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          {...propsDeSelectDeFiltro}
          size="small"
          label="Presença"
          value={presenca}
          sx={{ width: { xs: '100%', sm: 210 } }}
          onChange={(e) => setPresenca(e.target.value as typeof presenca)}
        >
          <MenuItem value="">Todos os inscritos</MenuItem>
          <MenuItem value="presentes">Presentes</MenuItem>
          <MenuItem value="ausentes">Ausentes</MenuItem>
        </TextField>
        {certificado && (
          <SituacaoDoCertificado
            ligado={ligado}
            cargaHoraria={certificado.workload}
            onLigar={() => navigate(`/admin/eventos/${eventId}/editar`)}
          />
        )}
      </Paper>

      <BarraDeSelecao
        quantos={selecionados.length}
        rotuloDaRegiao="Inscritos selecionados"
        // desligado, a barra só conta e limpa: a barra de busca diz o porquê
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
      <Card sx={cardTabelaSx}>
        <DataGrid
          loading={isLoading}
          rows={visiveis}
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
          // altura pelo conteúdo: a inscrição tem o tipo e o grupo embaixo
          getRowHeight={() => 'auto'}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
            // no celular a inscrição sai, para a presença caber sem rolar de lado
            columns: {
              columnVisibilityModel: { tipo: !celular },
            },
          }}
          slots={{ toolbar: GridToolbar }}
          columnHeaderHeight={44}
          sx={dataGridSx(theme)}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Card>
    </Stack>
  );
}
