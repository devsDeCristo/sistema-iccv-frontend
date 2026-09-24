import { useEffect, useMemo, useRef, useState } from 'react';
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  DeleteOutline,
  OpenInNew,
  RestoreOutlined,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import {
  useGetTermsVersions,
  usePublishTerms,
  VersaoDosTermos,
} from '../../../features/terms/api';
import { formatDateTime } from '../../../utils';

/** Barra mínima: o visual é o da página pública, e não o de quem escreve */
const MODULOS = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};
const FORMATOS = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link',
];
const MAXIMO_DE_FRASES = 10;

/**
 * Termos de Uso, editados pelo super admin ou dev.
 *
 * Publicar cria uma versão nova — a anterior fica no histórico como estava,
 * porque é o texto que alguém aceitou. A decisão que importa é a do interruptor:
 * mudança relevante faz todo mundo aceitar de novo no próximo acesso; correção
 * de texto não.
 */
function TermsSettings() {
  const theme = useTheme();
  const { data: versoes, isLoading, isError } = useGetTermsVersions();
  const vigente = versoes?.[0];

  const [texto, setTexto] = useState('');
  const [resumo, setResumo] = useState<string[]>([]);
  const [relevante, setRelevante] = useState(false);
  /**
   * A vigente como o editor a devolve. O Quill reescreve o HTML ao abrir, e
   * comparar com o texto cru do banco liberaria "Publicar" sem ninguém ter
   * mexido em nada.
   */
  const [baseDaVigente, setBaseDaVigente] = useState<string | null>(null);
  const esperandoNormalizar = useRef(false);

  const carregar = (versao?: VersaoDosTermos) => {
    setTexto(versao?.content ?? '');
    setResumo(versao?.summary ?? []);
  };

  // o editor abre com a vigente: quase toda mudança parte dela
  useEffect(() => {
    if (!vigente) return;
    esperandoNormalizar.current = true;
    setBaseDaVigente(null);
    carregar(vigente);
  }, [vigente?.version]);

  const editar = (valor: string) => {
    setTexto(valor);
    if (esperandoNormalizar.current) {
      esperandoNormalizar.current = false;
      setBaseDaVigente(valor);
    }
  };

  const mudou = useMemo(
    () =>
      !!vigente &&
      (texto !== (baseDaVigente ?? vigente.content) ||
        JSON.stringify(resumo.map((f) => f.trim()).filter(Boolean)) !==
          JSON.stringify(vigente.summary)),
    [texto, resumo, vigente, baseDaVigente]
  );

  const { mutate: publicar, isLoading: publicando } = usePublishTerms({
    onSuccess: () => {
      setRelevante(false);
      toast.success('Nova versão dos Termos de Uso publicada.');
    },
  });

  const confirmarPublicacao = () => {
    Swal.fire({
      title: 'Publicar nova versão?',
      html: relevante
        ? 'É uma <b>mudança relevante</b>: todos os usuários, inclusive você, terão que aceitar os termos de novo no próximo acesso.'
        : 'É uma <b>correção</b>: o texto muda na página, mas ninguém precisa aceitar de novo.',
      icon: relevante ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Publicar',
      cancelButtonText: 'Cancelar',
    }).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      publicar(
        { content: texto, summary: resumo, requiresAcceptance: relevante },
        {
          onError: (erro: any) => {
            toast.error(
              [erro?.response?.data?.message].flat()[0] ??
                'Não foi possível publicar. Tente novamente.'
            );
          },
        }
      );
    });
  };

  const trocarFrase = (indice: number, valor: string) =>
    setResumo((atual) => atual.map((f, i) => (i === indice ? valor : f)));

  return (
    <PageStyle>
      <Header
        title="Termos de Uso"
        description="O texto que todos aceitam para usar a plataforma"
      >
        <Button
          variant="outlined"
          startIcon={<OpenInNew />}
          href="/termos"
          target="_blank"
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Ver página pública
        </Button>
      </Header>

      {isLoading ? (
        <Stack gap={2}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={420} />
        </Stack>
      ) : isError ? (
        // sem as versões não há o que editar: melhor dizer do que abrir um
        // editor vazio, que publicaria um texto do zero
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Não foi possível carregar os Termos de Uso. Se o sistema acabou de ser
          atualizado, confira se as migrações do banco foram aplicadas.
        </Alert>
      ) : (
        <Stack gap={2.5}>
          {vigente && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                letterSpacing="0.06em"
              >
                VERSÃO VIGENTE
              </Typography>
              <Typography sx={{ fontWeight: 700, mt: 0.25 }}>
                {vigente.version} · publicada em{' '}
                {formatDateTime(vigente.publishedAt)}
                {vigente.publishedBy
                  ? ` por ${vigente.publishedBy.fullName}`
                  : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vigente.acceptances}{' '}
                {vigente.acceptances === 1
                  ? 'aceite registrado'
                  : 'aceites registrados'}{' '}
                nesta versão
              </Typography>
            </Paper>
          )}

          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Escreva em termos gerais — tipos de dados, finalidades,
            responsabilidades. Não descreva o funcionamento do sistema, nomes de
            fornecedores ou regras de negócio. Cada <b>Título</b> vira uma seção
            do índice e é numerado sozinho na página.
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Em resumo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Frases curtas que aparecem no topo da página, antes do texto.
            </Typography>
            <Stack gap={1}>
              {resumo.map((frase, indice) => (
                <Stack key={indice} direction="row" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    value={frase}
                    inputProps={{ maxLength: 300 }}
                    onChange={(evento) =>
                      trocarFrase(indice, evento.target.value)
                    }
                  />
                  <Tooltip title="Remover frase">
                    <IconButton
                      onClick={() =>
                        setResumo((atual) =>
                          atual.filter((_, i) => i !== indice)
                        )
                      }
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
            <Button
              startIcon={<Add />}
              disabled={resumo.length >= MAXIMO_DE_FRASES}
              onClick={() => setResumo((atual) => [...atual, ''])}
              sx={{ mt: 1, textTransform: 'none' }}
            >
              Adicionar frase
            </Button>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              '& .ql-toolbar': {
                border: 'none',
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .ql-container': {
                border: 'none',
                fontSize: '0.975rem',
                fontFamily: 'inherit',
              },
              '& .ql-editor': { minHeight: 420, lineHeight: 1.7 },
              '& .ql-editor h2': { fontSize: '1.2rem', fontWeight: 800, mt: 2 },
              '& .ql-editor h3': { fontSize: '1rem', fontWeight: 700 },
              '& .ql-snow .ql-stroke': { stroke: theme.palette.text.secondary },
              '& .ql-snow .ql-fill': { fill: theme.palette.text.secondary },
              '& .ql-snow .ql-picker': { color: theme.palette.text.secondary },
            }}
          >
            <ReactQuill
              theme="snow"
              value={texto}
              onChange={editar}
              modules={MODULOS}
              formats={FORMATOS}
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(
                relevante ? theme.palette.warning.main : theme.palette.divider,
                relevante ? 0.6 : 1
              )}`,
              backgroundColor: relevante
                ? alpha(theme.palette.warning.main, 0.06)
                : undefined,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              gap={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <FormControlLabel
                sx={{ alignItems: 'flex-start', m: 0 }}
                control={
                  <Switch
                    checked={relevante}
                    onChange={(evento) => setRelevante(evento.target.checked)}
                  />
                }
                label={
                  <Box sx={{ pt: 0.75 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Mudança relevante — exigir novo aceite de todos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Marque quando mudar o que é coletado, para que serve, com
                      quem é compartilhado, valores ou responsabilidades.
                      Correção de texto não precisa.
                    </Typography>
                  </Box>
                }
              />
              <Button
                variant="contained"
                disabled={!mudou || publicando}
                onClick={confirmarPublicacao}
                sx={{
                  flexShrink: 0,
                  borderRadius: 2,
                  textTransform: 'none',
                  minWidth: 190,
                }}
              >
                {publicando ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Publicar nova versão'
                )}
              </Button>
            </Stack>
          </Paper>

          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Histórico</Typography>
              <Typography variant="body2" color="text.secondary">
                Versões publicadas não mudam: cada aceite aponta para o texto
                exato que a pessoa leu.
              </Typography>
            </Box>
            {(versoes ?? []).map((versao) => (
              <Stack
                key={versao.id}
                direction="row"
                alignItems="center"
                gap={1.5}
                sx={{
                  px: 2,
                  py: 1.25,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    gap={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {versao.version}
                    </Typography>
                    {versao === vigente && (
                      <Chip label="Vigente" size="small" color="primary" />
                    )}
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        versao.requiresAcceptance
                          ? 'Exigiu novo aceite'
                          : 'Correção'
                      }
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(versao.publishedAt)}
                    {versao.publishedBy
                      ? ` · ${versao.publishedBy.fullName}`
                      : ''}
                    {` · ${versao.acceptances} ${versao.acceptances === 1 ? 'aceite' : 'aceites'}`}
                  </Typography>
                </Box>
                <Tooltip title="Carregar este texto no editor">
                  <IconButton onClick={() => carregar(versao)}>
                    <RestoreOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Card>
        </Stack>
      )}
    </PageStyle>
  );
}

export { TermsSettings };
