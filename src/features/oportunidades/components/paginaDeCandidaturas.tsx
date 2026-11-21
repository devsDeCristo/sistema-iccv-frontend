import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  Link,
  ListItemIcon,
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
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  ContentCopy,
  Description,
  DownloadOutlined,
  EmailOutlined,
  EventAvailable,
  FiberNew,
  FileDownloadOutlined,
  GridOn,
  PeopleOutline,
  PictureAsPdfOutlined,
  Search,
  StarOutline,
  VisibilityOutlined,
  WhatsApp,
} from '@mui/icons-material';
import { pdf } from '@react-pdf/renderer';
import FileSaver from 'file-saver';
import { toast } from 'react-toastify';

import CustomChip from '../../../components/customChip';
import { superficieSx } from '../../../components/listPageStyles';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { StatusCards } from '../../../components/statusCards';
import { UserAvatar } from '../../../components/userAvatar';
import {
  buildFileName,
  exportXlsx,
} from '../../admin/events/components/exportUsers/exportFile';
import {
  baixarCurriculo,
  buscarCurriculo,
  useAcompanharCandidatura,
} from '../api';
import {
  DE_ESCOLHA,
  ETAPAS,
  etapaDe,
  formatarSalario,
  linkDoWhatsApp,
  respostaEmTexto,
} from '../formulario';
import {
  EtapaDaCandidatura,
  Interessado,
  OportunidadeDaIgreja,
  Resposta,
  Salario,
} from '../types';
import { PdfCandidaturas } from './pdfCandidaturas';

type Ordem = 'recentes' | 'antigas' | 'nome';

const UM_DIA = 86_400_000;

const dataEHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

const semAcento = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const respostaDoTipo = (c: Interessado, tipo: Resposta['tipo']) =>
  Object.values(c.respostas).find((r) => r.tipo === tipo);
const temCurriculo = (c: Interessado) => !!respostaDoTipo(c, 'CURRICULO');
const pretensao = (c: Interessado) =>
  respostaDoTipo(c, 'PRETENSAO_SALARIAL')?.valor as Salario | undefined;

/** O chip da etapa, na cor dela */
function ChipDaEtapa({ etapa }: { etapa: EtapaDaCandidatura }) {
  const theme = useTheme();
  const { rotulo, tom } = etapaDe(etapa);
  return (
    <CustomChip
      size="small"
      label={rotulo}
      customColor={theme.palette[tom].main}
    />
  );
}

/** Um candidato na lista da esquerda */
function ItemDaLista({
  candidato,
  ativo,
  onAbrir,
}: {
  candidato: Interessado;
  ativo: boolean;
  onAbrir: () => void;
}) {
  const theme = useTheme();
  const salario = formatarSalario(pretensao(candidato));
  return (
    <ButtonBase
      onClick={onAbrir}
      aria-current={ativo || undefined}
      sx={{
        width: '100%',
        textAlign: 'left',
        justifyContent: 'flex-start',
        px: 2,
        py: 1.25,
        gap: 1.5,
        borderLeft: `3px solid ${ativo ? theme.palette.primary.main : 'transparent'}`,
        backgroundColor: ativo
          ? alpha(theme.palette.primary.main, 0.08)
          : 'transparent',
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
      }}
    >
      <UserAvatar
        name={candidato.user.fullName}
        photoUrl={candidato.user.profilePhotoUrl ?? undefined}
        sx={{ width: 36, height: 36, fontSize: 14 }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, flex: 1 }}>
            {candidato.user.fullName}
          </Typography>
          <Typography
            sx={{ fontSize: 12, color: 'text.secondary', flexShrink: 0 }}
          >
            {dataCurta(candidato.createdAt)}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ mt: 0.5, color: 'text.secondary', '& svg': { fontSize: 15 } }}
        >
          <ChipDaEtapa etapa={candidato.stage} />
          {temCurriculo(candidato) && (
            <Tooltip title="Enviou currículo">
              <Description aria-label="Enviou currículo" />
            </Tooltip>
          )}
          {salario && (
            <Typography noWrap sx={{ fontSize: 12 }}>
              {salario}
            </Typography>
          )}
        </Stack>
      </Box>
    </ButtonBase>
  );
}

/** Uma resposta no detalhe, no jeito do tipo dela */
function RespostaDoCandidato({
  resposta,
  onVerCurriculo,
  onBaixarCurriculo,
}: {
  resposta: Resposta;
  onVerCurriculo: () => void;
  onBaixarCurriculo: () => void;
}) {
  let conteudo: React.ReactNode;
  if (resposta.tipo === 'CURRICULO') {
    conteudo = (
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          📄 {respostaEmTexto(resposta)}
        </Typography>
        <Button
          size="small"
          startIcon={<VisibilityOutlined />}
          onClick={onVerCurriculo}
          sx={{ textTransform: 'none' }}
        >
          Ver
        </Button>
        <Button
          size="small"
          startIcon={<DownloadOutlined />}
          onClick={onBaixarCurriculo}
          sx={{ textTransform: 'none' }}
        >
          Baixar
        </Button>
      </Stack>
    );
  } else if (resposta.tipo === 'REDE_SOCIAL') {
    conteudo = (
      <Link
        href={String(resposta.valor)}
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        sx={{ overflowWrap: 'anywhere' }}
      >
        {String(resposta.valor)} ↗
      </Link>
    );
  } else {
    conteudo = (
      <Typography
        variant="body2"
        sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
      >
        {respostaEmTexto(resposta)}
      </Typography>
    );
  }
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 0.25,
        }}
      >
        {resposta.rotulo}
      </Typography>
      {conteudo}
    </Box>
  );
}

/** O currículo aberto na própria página, num visualizador de PDF */
function VisualizadorDeCurriculo({
  caminho,
  candidato,
  onClose,
}: {
  caminho: string;
  candidato: Interessado | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!candidato) return;
    let endereco: string | null = null;
    setUrl(null);
    setFalhou(false);
    buscarCurriculo(caminho, candidato.user.id)
      .then((blob) => {
        endereco = URL.createObjectURL(blob);
        setUrl(endereco);
      })
      .catch(() => setFalhou(true));
    return () => void (endereco && URL.revokeObjectURL(endereco));
  }, [caminho, candidato]);

  return (
    <ResponsiveModal
      open={!!candidato}
      onClose={onClose}
      mobileMode="fullScreen"
      maxWidth="lg"
      fullHeight
      title={`Currículo de ${candidato?.user.fullName ?? ''}`}
    >
      {falhou ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Não foi possível abrir o currículo.
        </Typography>
      ) : !url ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1}>
          <Box
            component="iframe"
            src={url}
            title="Currículo"
            sx={{
              width: '100%',
              height: { xs: '70vh', md: '75vh' },
              border: 0,
              borderRadius: 2,
              backgroundColor: '#fff',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Se o arquivo não aparecer (alguns celulares não mostram PDF aqui),
            use Baixar.
          </Typography>
        </Stack>
      )}
    </ResponsiveModal>
  );
}

/** O detalhe de um candidato: contato, acompanhamento e respostas */
function DetalheDoCandidato({
  vaga,
  caminho,
  candidato,
  anterior,
  proximo,
  onVoltar,
}: {
  vaga: OportunidadeDaIgreja;
  caminho: string;
  candidato: Interessado;
  anterior?: () => void;
  proximo?: () => void;
  onVoltar?: () => void;
}) {
  const acompanhar = useAcompanharCandidatura();
  const [nota, setNota] = useState(candidato.note ?? '');
  const [vendo, setVendo] = useState<Interessado | null>(null);
  const whatsapp = linkDoWhatsApp(candidato.user.cellphone);
  const { user } = candidato;

  // a ordem do formulário da vaga; o que foi respondido em campo já removido
  // vem no fim, com o rótulo de quando respondeu
  const respostas = useMemo(() => {
    const ordem = vaga.formulario.campos.map((c) => c.id);
    return Object.entries(candidato.respostas)
      .sort(
        ([a], [b]) =>
          (ordem.indexOf(a) + 1 || 999) - (ordem.indexOf(b) + 1 || 999)
      )
      .map(([, r]) => r);
  }, [vaga.formulario.campos, candidato.respostas]);

  const copiar = async () => {
    const texto = [user.fullName, user.cellphone, user.email]
      .filter(Boolean)
      .join(' · ');
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('Contato copiado');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const baixar = () =>
    baixarCurriculo(
      caminho,
      user.id,
      respostaEmTexto(respostaDoTipo(candidato, 'CURRICULO')!)
    ).catch(() => toast.error('Não foi possível baixar o currículo'));

  return (
    <Paper sx={{ ...superficieSx, p: { xs: 2, sm: 2.5 } }}>
      {onVoltar && (
        <Button
          startIcon={<ArrowBack />}
          onClick={onVoltar}
          sx={{ textTransform: 'none', mb: 1, ml: -1 }}
        >
          Todos os candidatos
        </Button>
      )}

      <Stack direction="row" gap={1.5} alignItems="center">
        <UserAvatar
          name={user.fullName}
          photoUrl={user.profilePhotoUrl ?? undefined}
          sx={{ width: 52, height: 52, fontSize: 18 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
            {user.fullName}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere' }}
          >
            {[user.email, user.cellphone].filter(Boolean).join(' · ')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Candidatou-se em {dataEHora(candidato.createdAt)}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
        {whatsapp && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<WhatsApp />}
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textTransform: 'none' }}
          >
            WhatsApp
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<EmailOutlined />}
          href={`mailto:${user.email}?subject=${encodeURIComponent(vaga.title)}`}
          sx={{ textTransform: 'none' }}
        >
          E-mail
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={copiar}
          sx={{ textTransform: 'none' }}
        >
          Copiar contato
        </Button>
      </Stack>

      {/* o acompanhamento: interno, o candidato não vê */}
      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          backgroundColor: 'background.default',
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        {/* em coluna: a etapa em cima e a anotação embaixo, as duas na largura toda */}
        <Stack gap={1.5}>
          <TextField
            select
            size="small"
            label="Etapa"
            value={candidato.stage}
            disabled={acompanhar.isLoading}
            onChange={(e) =>
              acompanhar.mutate({
                caminho,
                userId: user.id,
                etapa: e.target.value as EtapaDaCandidatura,
              })
            }
            sx={{ minWidth: 180 }}
          >
            {ETAPAS.map((e) => (
              <MenuItem key={e.valor} value={e.valor}>
                {e.rotulo}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ flex: 1 }}>
            <TextField
              size="small"
              label="Anotação interna"
              placeholder="Ex.: liguei dia 22, entrevista na sexta"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              inputProps={{ maxLength: 2000 }}
              multiline
              minRows={2}
              fullWidth
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                Só quem conduz a vaga vê a etapa e a anotação.
              </Typography>
              <Button
                size="small"
                disabled={
                  nota === (candidato.note ?? '') || acompanhar.isLoading
                }
                onClick={() =>
                  acompanhar.mutate({ caminho, userId: user.id, nota })
                }
                sx={{ textTransform: 'none' }}
              >
                Salvar anotação
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {respostas.length ? (
        <Stack spacing={1.75}>
          {respostas.map((r) => (
            <RespostaDoCandidato
              key={`${r.rotulo}-${r.tipo}`}
              resposta={r}
              onVerCurriculo={() => setVendo(candidato)}
              onBaixarCurriculo={baixar}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Sem respostas além do contato.
        </Typography>
      )}

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 2.5 }}>
        <Button
          startIcon={<ChevronLeft />}
          disabled={!anterior}
          onClick={anterior}
          sx={{ textTransform: 'none' }}
        >
          Anterior
        </Button>
        <Button
          endIcon={<ChevronRight />}
          disabled={!proximo}
          onClick={proximo}
          sx={{ textTransform: 'none' }}
        >
          Próximo
        </Button>
      </Stack>

      <VisualizadorDeCurriculo
        caminho={caminho}
        candidato={vendo}
        onClose={() => setVendo(null)}
      />
    </Paper>
  );
}

/**
 * As candidaturas de uma vaga, numa página: a lista à esquerda (busca,
 * filtros pelas respostas, ordem) e o detalhe do candidato à direita, com o
 * contato, a etapa e a anotação internas, as respostas e o currículo. No
 * celular, a lista ou o detalhe.
 *
 * A mesma para o admin e para quem propôs a vaga: `caminho` é o da vaga na
 * API (`caminhoNoPainel` ou `caminhoDaProposta`). O candidato aberto fica no
 * endereço (`?candidato=<id>`).
 */
export function PaginaDeCandidaturas({
  vaga,
  caminho,
}: {
  vaga: OportunidadeDaIgreja;
  caminho: string;
}) {
  const theme = useTheme();
  const larga = useMediaQuery(theme.breakpoints.up('md'));
  const [params, setParams] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState<Ordem>('recentes');
  const [etapa, setEtapa] = useState<EtapaDaCandidatura | ''>('');
  const [soComCurriculo, setSoComCurriculo] = useState(false);
  const [pretensaoAte, setPretensaoAte] = useState('');
  const [escolhas, setEscolhas] = useState<Record<string, string>>({});
  const [menuExportar, setMenuExportar] = useState<HTMLElement | null>(null);
  const [gerando, setGerando] = useState(false);

  const todas = vaga.interests;
  const perguntasDeEscolha = vaga.formulario.campos.filter(
    (c) => DE_ESCOLHA.includes(c.tipo) && c.opcoes?.length
  );
  const temPretensao = vaga.formulario.campos.some(
    (c) => c.tipo === 'PRETENSAO_SALARIAL'
  );

  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    const teto = pretensaoAte === '' ? null : Number(pretensaoAte);
    const lista = todas.filter((c) => {
      if (
        termo &&
        !semAcento(`${c.user.fullName} ${c.user.email}`).includes(termo)
      ) {
        return false;
      }
      if (etapa && c.stage !== etapa) return false;
      if (soComCurriculo && !temCurriculo(c)) return false;
      if (teto !== null) {
        const p = pretensao(c);
        if (!p || p.min > teto) return false;
      }
      return Object.entries(escolhas).every(([campoId, opcao]) => {
        if (!opcao) return true;
        const valor = c.respostas[campoId]?.valor;
        return Array.isArray(valor) ? valor.includes(opcao) : valor === opcao;
      });
    });
    return lista.sort((a, b) =>
      ordem === 'nome'
        ? a.user.fullName.localeCompare(b.user.fullName, 'pt-BR')
        : (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) *
          (ordem === 'recentes' ? 1 : -1)
    );
  }, [todas, busca, etapa, soComCurriculo, pretensaoAte, escolhas, ordem]);

  const filtrando =
    !!busca ||
    !!etapa ||
    soComCurriculo ||
    pretensaoAte !== '' ||
    Object.values(escolhas).some(Boolean);
  const limpar = () => {
    setBusca('');
    setEtapa('');
    setSoComCurriculo(false);
    setPretensaoAte('');
    setEscolhas({});
  };

  // no celular, sem candidato no endereço, só a lista; na tela grande, o
  // primeiro da lista já aparece
  const pedido = params.get('candidato');
  const indice = filtradas.findIndex((c) => c.user.id === pedido);
  const aberto =
    indice >= 0 ? filtradas[indice] : larga ? filtradas[0] : undefined;
  const posicao = aberto ? filtradas.indexOf(aberto) : -1;
  const abrir = (c?: Interessado) =>
    setParams(c ? { candidato: c.user.id } : {}, { replace: true });

  const exportarPdf = async () => {
    setMenuExportar(null);
    setGerando(true);
    try {
      const blob = await pdf(
        <PdfCandidaturas vaga={{ ...vaga, interests: filtradas }} />
      ).toBlob();
      FileSaver.saveAs(blob, buildFileName(vaga.title, 'pdf', 'candidaturas'));
    } finally {
      setGerando(false);
    }
  };

  // uma coluna por pergunta do formulário (na ordem dele), mais as respostas
  // a campos que já saíram; a anotação, interna, não vai
  const exportarExcel = () => {
    setMenuExportar(null);
    const colunas = new Map<string, string>();
    vaga.formulario.campos.forEach((c) => colunas.set(c.id, c.rotulo));
    filtradas.forEach((c) =>
      Object.entries(c.respostas).forEach(([id, r]) => {
        if (!colunas.has(id)) colunas.set(id, r.rotulo);
      })
    );
    const linhas = [
      [
        'Nome',
        'Celular',
        'E-mail',
        'Candidatou-se em',
        'Etapa',
        ...colunas.values(),
      ],
      ...filtradas.map((c) => [
        c.user.fullName,
        c.user.cellphone ?? '',
        c.user.email,
        dataEHora(c.createdAt),
        etapaDe(c.stage).rotulo,
        ...[...colunas.keys()].map((id) =>
          c.respostas[id] ? respostaEmTexto(c.respostas[id]) : ''
        ),
      ]),
    ];
    exportXlsx(linhas, buildFileName(vaga.title, 'xlsx', 'candidaturas'));
  };

  const agora = Date.now();
  const cards = [
    {
      title: 'Candidaturas',
      value: todas.length,
      subtitle: 'no total',
      icon: <PeopleOutline />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Com currículo',
      value: todas.filter(temCurriculo).length,
      subtitle: 'enviaram o PDF',
      icon: <Description />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Novas',
      value: todas.filter(
        (c) => agora - new Date(c.createdAt).getTime() < UM_DIA
      ).length,
      subtitle: 'nas últimas 24 horas',
      icon: <FiberNew />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Selecionadas',
      value: todas.filter((c) => c.stage === 'SELECTED').length,
      subtitle: 'na etapa final',
      icon: <StarOutline />,
      color: theme.palette.primary.main,
    },
  ];

  const barraDeFiltros = (
    <Stack spacing={1.25} sx={{ p: 2 }}>
      <TextField
        size="small"
        placeholder="Buscar nome ou e-mail"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction="row" gap={1}>
        <TextField
          select
          size="small"
          label="Etapa"
          value={etapa}
          onChange={(e) => setEtapa(e.target.value as EtapaDaCandidatura | '')}
          sx={{ flex: 1 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {ETAPAS.map((e) => (
            <MenuItem key={e.valor} value={e.valor}>
              {e.rotulo}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Ordem"
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as Ordem)}
          sx={{ flex: 1 }}
        >
          <MenuItem value="recentes">Mais recentes</MenuItem>
          <MenuItem value="antigas">Mais antigas</MenuItem>
          <MenuItem value="nome">Nome</MenuItem>
        </TextField>
      </Stack>
      {/* cada pergunta de escolha do formulário vira um filtro */}
      {perguntasDeEscolha.map((campo) => (
        <TextField
          key={campo.id}
          select
          size="small"
          label={campo.rotulo}
          value={escolhas[campo.id] ?? ''}
          onChange={(e) =>
            setEscolhas((a) => ({ ...a, [campo.id]: e.target.value }))
          }
        >
          <MenuItem value="">Qualquer resposta</MenuItem>
          {campo.opcoes!.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      ))}
      {temPretensao && (
        <TextField
          size="small"
          type="number"
          label="Pretensão até"
          value={pretensaoAte}
          onChange={(e) => setPretensaoAte(e.target.value)}
          inputProps={{ min: 0, step: 100 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">R$</InputAdornment>
            ),
          }}
        />
      )}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={soComCurriculo}
              onChange={(e) => setSoComCurriculo(e.target.checked)}
            />
          }
          label={<Typography variant="body2">Só com currículo</Typography>}
        />
        {filtrando && (
          <Button size="small" onClick={limpar} sx={{ textTransform: 'none' }}>
            Limpar filtros
          </Button>
        )}
      </Stack>
    </Stack>
  );

  const lista = (
    <Paper sx={{ ...superficieSx, overflow: 'hidden' }}>
      {barraDeFiltros}
      <Divider />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', px: 2, py: 1 }}
      >
        {filtradas.length === todas.length
          ? `${todas.length} candidatura(s)`
          : `${filtradas.length} de ${todas.length} candidatura(s)`}
      </Typography>
      <Box sx={{ maxHeight: { md: 'calc(100vh - 360px)' }, overflowY: 'auto' }}>
        {filtradas.length ? (
          <Stack divider={<Divider flexItem />}>
            {filtradas.map((c) => (
              <ItemDaLista
                key={c.user.id}
                candidato={c}
                ativo={aberto?.user.id === c.user.id}
                onAbrir={() => abrir(c)}
              />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            Nenhuma candidatura com esses filtros.
          </Typography>
        )}
      </Box>
    </Paper>
  );

  if (!todas.length) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
        <PeopleOutline sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography color="text.secondary">
          Ninguém se candidatou ainda.
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <StatusCards cards={cards} />

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlined />}
          disabled={!filtradas.length || gerando}
          onClick={(e) => setMenuExportar(e.currentTarget)}
          sx={{ textTransform: 'none' }}
        >
          {gerando ? 'Gerando…' : `Exportar (${filtradas.length})`}
        </Button>
        <Menu
          anchorEl={menuExportar}
          open={!!menuExportar}
          onClose={() => setMenuExportar(null)}
        >
          <MenuItem onClick={exportarPdf}>
            <ListItemIcon>
              <PictureAsPdfOutlined fontSize="small" />
            </ListItemIcon>
            PDF (contato e respostas)
          </MenuItem>
          <MenuItem onClick={exportarExcel}>
            <ListItemIcon>
              <GridOn fontSize="small" />
            </ListItemIcon>
            Excel (uma coluna por pergunta)
          </MenuItem>
        </Menu>
      </Stack>

      {larga ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 380px) minmax(0, 1fr)',
            gap: 2,
            alignItems: 'start',
          }}
        >
          {lista}
          {aberto ? (
            <DetalheDoCandidato
              key={aberto.user.id}
              vaga={vaga}
              caminho={caminho}
              candidato={aberto}
              anterior={
                posicao > 0 ? () => abrir(filtradas[posicao - 1]) : undefined
              }
              proximo={
                posicao < filtradas.length - 1
                  ? () => abrir(filtradas[posicao + 1])
                  : undefined
              }
            />
          ) : (
            <Paper sx={{ ...superficieSx, p: 4, textAlign: 'center' }}>
              <EventAvailable sx={{ fontSize: 36, color: 'text.disabled' }} />
              <Typography color="text.secondary">
                Escolha um candidato na lista.
              </Typography>
            </Paper>
          )}
        </Box>
      ) : aberto ? (
        <DetalheDoCandidato
          key={aberto.user.id}
          vaga={vaga}
          caminho={caminho}
          candidato={aberto}
          anterior={
            posicao > 0 ? () => abrir(filtradas[posicao - 1]) : undefined
          }
          proximo={
            posicao < filtradas.length - 1
              ? () => abrir(filtradas[posicao + 1])
              : undefined
          }
          onVoltar={() => abrir()}
        />
      ) : (
        lista
      )}
    </>
  );
}
