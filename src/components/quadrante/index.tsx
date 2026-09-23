import { useMemo, useState } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  darken,
  getContrastRatio,
  GlobalStyles,
  IconButton,
  InputAdornment,
  lighten,
  Paper,
  Stack,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CakeOutlined,
  Download,
  EmailOutlined,
  PhoneIphoneOutlined,
  Print,
  Search,
  StarRounded,
  WhatsApp,
} from '@mui/icons-material';
import FileSaver from 'file-saver';
import { toast } from 'react-toastify';
import { Header } from '../header';
import { PageStyle } from '../pageStyle';
import { apiClient } from '../../config/lib/axios/api-client';
import { useGetQuadrante } from '../../features/admin/events/api/getQuadrante';
import { QuadranteData } from '../../features/admin/events/types';
import { ehCorHex } from '../../features/admin/events/eventColors';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../themes';

type Equipe = QuadranteData['teams'][number];
type Pessoa = Equipe['users'][number];

/** Mais arredondada que a Roboto do sistema: o quadrante é para folhear. */
const FONTE = '"Nunito", "Roboto", "Helvetica", sans-serif';

/** Datas gravadas à meia-noite em UTC: sem fixar o fuso, o Brasil vê o dia
 * anterior. Só dia e mês — é o aniversário, não a idade. */
function formatarAniversario(valor?: string) {
  if (!valor) return '';
  return new Date(valor).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

function soDigitos(valor = '') {
  return valor.replace(/\D/g, '');
}

function formatarCelular(valor = '') {
  const d = soDigitos(valor);
  if (d.length === 11)
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return valor;
}

function linkWhatsApp(valor = '') {
  const d = soDigitos(valor);
  if (d.length < 10) return null;
  return `https://wa.me/${d.length <= 11 ? `55${d}` : d}`;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return (
    (partes[0]?.[0] ?? '') +
    (partes.length > 1 ? partes[partes.length - 1][0] : '')
  ).toUpperCase();
}

/** Sem acento e em minúsculas, para a busca achar "joao" em "João". */
function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * A cor do evento num tom que dá para ler sobre o fundo atual.
 *
 * A paleta sai da logo e da capa, então pode ser qualquer coisa — um amarelo
 * some no papel branco, um azul-marinho some no modo escuro. Clareia ou
 * escurece aos poucos até o contraste de texto (4,5:1) aparecer.
 */
function corLegivel(cor: string, fundo: string, escuro: boolean) {
  let tom = cor;
  for (
    let passo = 1;
    passo <= 8 && getContrastRatio(tom, fundo) < 4.5;
    passo++
  ) {
    tom = escuro ? lighten(cor, passo * 0.1) : darken(cor, passo * 0.1);
  }
  return tom;
}

function usePaleta(data?: QuadranteData) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const fundo = theme.palette.background.paper;
  const cores = data?.event.colors;

  return useMemo(() => {
    const primaria = ehCorHex(cores?.primary) ? cores!.primary! : AZUL_VIVO;
    const secundaria = ehCorHex(cores?.secondary)
      ? cores!.secondary!
      : ehCorHex(cores?.primary)
        ? primaria
        : VIOLETA_VIVO;
    const terciaria = ehCorHex(cores?.tertiary) ? cores!.tertiary! : primaria;

    const base = [primaria, secundaria, terciaria];

    return {
      primaria,
      secundaria,
      /** cor de destaque de cada equipe: as três da paleta, em rodízio */
      daEquipe: (indice: number) => {
        const cor = base[indice % base.length];
        return { cor, texto: corLegivel(cor, fundo, escuro) };
      },
    };
  }, [cores, fundo, escuro]);
}

function LinhaDeContato({
  icone,
  children,
  href,
  titulo,
}: {
  icone: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  titulo: string;
}) {
  return (
    <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
      <Box
        sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}
        aria-hidden
      >
        {icone}
      </Box>
      <Typography
        component={href ? 'a' : 'span'}
        href={href}
        title={titulo}
        sx={{
          fontSize: 14,
          color: 'text.primary',
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '&:hover': href ? { textDecoration: 'underline' } : undefined,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

function CartaoPessoa({
  pessoa,
  cor,
  corTexto,
}: {
  pessoa: Pessoa;
  cor: string;
  corTexto: string;
}) {
  const theme = useTheme();
  const [fotoFalhou, setFotoFalhou] = useState(false);
  const lider = pessoa.roleTeam === 'LEADER';
  const whatsapp = linkWhatsApp(pessoa.cellphone);
  const foto =
    pessoa.profilePhotoUrl && !fotoFalhou ? pessoa.profilePhotoUrl : undefined;

  return (
    <Paper
      className="quadrante-cartao"
      sx={{
        position: 'relative',
        p: 2,
        pt: 2.5,
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'transform .15s ease, box-shadow .15s ease',
        // o líder se destaca pela moldura na cor da equipe
        ...(lider && { boxShadow: `0 0 0 2px ${alpha(cor, 0.8)}` }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: lider
            ? `0 0 0 2px ${cor}, 0 12px 24px -10px ${alpha(cor, 0.6)}`
            : `0 12px 24px -10px ${alpha(cor, 0.5)}`,
        },
        // faixa da equipe no topo
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 4,
          background: `linear-gradient(90deg, ${cor}, ${alpha(cor, 0.35)})`,
        },
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5} minWidth={0}>
        <Avatar
          src={foto}
          imgProps={{ onError: () => setFotoFalhou(true), loading: 'lazy' }}
          alt=""
          sx={{
            width: 64,
            height: 64,
            flexShrink: 0,
            fontSize: 22,
            fontWeight: 700,
            bgcolor: alpha(cor, theme.palette.mode === 'dark' ? 0.3 : 0.15),
            color: corTexto,
            boxShadow: `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 5px ${alpha(cor, 0.55)}`,
          }}
        >
          {iniciais(pessoa.fullName)}
        </Avatar>

        <Box minWidth={0}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.25 }}>
            {pessoa.fullName}
          </Typography>
          {lider && (
            <Chip
              icon={<StarRounded sx={{ fontSize: 16 }} />}
              label="Líder"
              size="small"
              sx={{
                mt: 0.5,
                height: 22,
                fontWeight: 700,
                fontSize: 12,
                color: corTexto,
                bgcolor: alpha(
                  cor,
                  theme.palette.mode === 'dark' ? 0.22 : 0.12
                ),
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
          )}
        </Box>
      </Stack>

      <Stack gap={0.75} minWidth={0}>
        <Stack direction="row" alignItems="center" gap={0.5} minWidth={0}>
          <Box flexGrow={1} minWidth={0}>
            <LinhaDeContato
              icone={<PhoneIphoneOutlined fontSize="small" />}
              href={`tel:${soDigitos(pessoa.cellphone)}`}
              titulo="Ligar"
            >
              {formatarCelular(pessoa.cellphone)}
            </LinhaDeContato>
          </Box>
          {whatsapp && (
            <Tooltip title="Conversar no WhatsApp">
              <IconButton
                size="small"
                component="a"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="quadrante-sem-impressao"
                sx={{ color: '#25D366', my: -0.5 }}
                aria-label={`WhatsApp de ${pessoa.fullName}`}
              >
                <WhatsApp fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <LinhaDeContato
          icone={<EmailOutlined fontSize="small" />}
          href={`mailto:${pessoa.email}`}
          titulo={pessoa.email}
        >
          {pessoa.email}
        </LinhaDeContato>
        <LinhaDeContato
          icone={<CakeOutlined fontSize="small" />}
          titulo="Aniversário"
        >
          {formatarAniversario(pessoa.birthday)}
        </LinhaDeContato>
      </Stack>
    </Paper>
  );
}

function SecaoEquipe({
  equipe,
  cor,
  corTexto,
}: {
  equipe: Equipe;
  cor: string;
  corTexto: string;
}) {
  const total = equipe.users.length;

  return (
    <Box
      component="section"
      id={`equipe-${equipe.id}`}
      className="quadrante-equipe"
      sx={{ scrollMarginTop: 24 }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        className="quadrante-titulo"
        sx={{ mb: 2 }}
      >
        <Box
          sx={{
            width: 6,
            alignSelf: 'stretch',
            minHeight: 32,
            borderRadius: 3,
            background: `linear-gradient(180deg, ${cor}, ${alpha(cor, 0.4)})`,
          }}
        />
        <Typography
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: 20, sm: 24 },
            lineHeight: 1.2,
          }}
        >
          {equipe.name}
        </Typography>
        <Chip
          label={`${total} ${total === 1 ? 'pessoa' : 'pessoas'}`}
          size="small"
          sx={{
            fontWeight: 700,
            color: corTexto,
            bgcolor: alpha(cor, 0.14),
          }}
        />
      </Stack>

      <Box
        className="quadrante-grade"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 2,
        }}
      >
        {equipe.users.map((pessoa) => (
          <CartaoPessoa
            key={pessoa.id}
            pessoa={pessoa}
            cor={cor}
            corTexto={corTexto}
          />
        ))}
      </Box>
    </Box>
  );
}

/**
 * Impressão: sai o quadrante, não a tela. Esconder tudo e revelar só o bloco
 * imprimível é o que funciona com o menu e o cabeçalho do sistema em volta.
 * No papel o modo escuro não faz sentido — tudo volta para fundo branco.
 */
function estilosDeImpressao(theme: Theme) {
  return {
    '@media print': {
      'body *': { visibility: 'hidden' },
      '#quadrante-impressao, #quadrante-impressao *': { visibility: 'visible' },
      '#quadrante-impressao .quadrante-sem-impressao, #quadrante-impressao .quadrante-sem-impressao *':
        { display: 'none !important' },
      '#quadrante-impressao': {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      },
      '#quadrante-impressao .quadrante-grade': {
        gridTemplateColumns: 'repeat(4, 1fr) !important',
        gap: '8px !important',
      },
      '#quadrante-impressao .quadrante-cartao': {
        breakInside: 'avoid',
        transform: 'none !important',
        backgroundColor: '#fff !important',
        color: '#000 !important',
        boxShadow: `0 0 0 1px ${theme.palette.grey[400]} !important`,
      },
      '#quadrante-impressao .quadrante-cartao *': {
        color: '#000 !important',
      },
      '#quadrante-impressao .quadrante-equipe *': { color: '#000' },
      '#quadrante-impressao .quadrante-titulo': { breakAfter: 'avoid' },
      '@page': { size: 'A4 landscape', margin: '10mm' },
    },
  };
}

interface QuadrantePageProps {
  eventId: string;
  /** para onde o botão de voltar leva: o painel ou a página do evento */
  pageBack: string;
}

/**
 * Tela do quadrante. Não copia o PDF: aproveita o que a tela tem e o papel
 * não — cores do evento, modo escuro, busca, contato com um toque. O PDF
 * continua saindo do servidor, no botão de baixar.
 *
 * Serve o painel e a área do usuário; quem pode abrir é o servidor que decide.
 */
function QuadrantePage({ eventId, pageBack }: QuadrantePageProps) {
  const theme = useTheme();
  const [baixando, setBaixando] = useState(false);
  const [busca, setBusca] = useState('');

  const { data, isLoading, isError } = useGetQuadrante(
    { eventId },
    { enabled: !!eventId, retry: false }
  );

  const paleta = usePaleta(data);

  const totalPessoas = useMemo(
    () =>
      data?.teams.reduce((soma, equipe) => soma + equipe.users.length, 0) ?? 0,
    [data]
  );

  /** A busca filtra as pessoas; equipe sem ninguém que bata some da tela. */
  const equipesFiltradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    const equipes = (data?.teams ?? []).map((equipe, indice) => ({
      equipe,
      indice,
    }));
    if (!termo) return equipes;

    const termoDigitos = soDigitos(termo);

    return equipes
      .map(({ equipe, indice }) => ({
        indice,
        equipe: {
          ...equipe,
          users: equipe.users.filter(
            (pessoa) =>
              normalizar(pessoa.fullName).includes(termo) ||
              normalizar(pessoa.email).includes(termo) ||
              (termoDigitos.length >= 3 &&
                soDigitos(pessoa.cellphone).includes(termoDigitos))
          ),
        },
      }))
      .filter(({ equipe }) => equipe.users.length);
  }, [data, busca]);

  const temEquipes = !!data?.teams.length;

  async function baixarPdf() {
    setBaixando(true);
    try {
      const resposta = await apiClient.get(`/events/${eventId}/quadrante/pdf`, {
        responseType: 'blob',
      });

      const nomeArquivo =
        /filename="(.+)"/.exec(
          resposta.headers['content-disposition'] ?? ''
        )?.[1] ?? 'quadrante.pdf';

      FileSaver.saveAs(resposta.data, nomeArquivo);
    } catch {
      toast.error('Não foi possível gerar o PDF do quadrante.');
    } finally {
      setBaixando(false);
    }
  }

  const irParaEquipe = (id: string) =>
    document
      .getElementById(`equipe-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /**
   * Capa do topo: a imagem do evento por baixo e um véu nas cores dele por
   * cima. O véu é escurecido de propósito — o texto é branco, e a paleta pode
   * ser clara o bastante para apagá-lo.
   */
  const veu = `linear-gradient(120deg, ${alpha(
    darken(paleta.primaria, 0.45),
    0.92
  )}, ${alpha(darken(paleta.secundaria, 0.35), 0.78)})`;

  return (
    <PageStyle>
      <GlobalStyles styles={estilosDeImpressao(theme)} />

      <Box
        sx={{
          fontFamily: FONTE,
          '& .MuiTypography-root, & .MuiButtonBase-root, & .MuiInputBase-root, & .MuiChip-label':
            { fontFamily: FONTE },
        }}
      >
        <Box className="quadrante-sem-impressao">
          <Header title="Quadrante" buttonBack pageBack={pageBack} />
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError || !data ? (
          <Typography sx={{ p: 4, textAlign: 'center' }}>
            O quadrante deste evento não está disponível.
          </Typography>
        ) : (
          <Box id="quadrante-impressao">
            <Paper
              className="quadrante-capa"
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                mb: 3,
                color: '#fff',
                backgroundColor: darken(paleta.primaria, 0.5),
                backgroundImage: data.event.coverUrl
                  ? `${veu}, url("${data.event.coverUrl}")`
                  : veu,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                gap={3}
                sx={{ p: { xs: 3, sm: 4 } }}
              >
                {data.event.logoUrl && (
                  <Box
                    component="img"
                    src={data.event.logoUrl}
                    alt=""
                    sx={{
                      height: { xs: 72, sm: 96 },
                      maxWidth: 200,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.35))',
                    }}
                  />
                )}

                <Box flexGrow={1} minWidth={0}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      opacity: 0.8,
                    }}
                  >
                    Quadrante
                  </Typography>
                  <Typography
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 26, sm: 34 },
                      lineHeight: 1.15,
                    }}
                  >
                    {data.event.name}
                  </Typography>
                  <Typography sx={{ mt: 0.5, opacity: 0.9 }}>
                    {data.event.periodo}
                  </Typography>
                  <Stack
                    direction="row"
                    gap={1}
                    flexWrap="wrap"
                    sx={{ mt: 1.5 }}
                  >
                    {[
                      `${data.teams.length} ${data.teams.length === 1 ? 'equipe' : 'equipes'}`,
                      `${totalPessoas} ${totalPessoas === 1 ? 'pessoa' : 'pessoas'}`,
                    ].map((texto) => (
                      <Chip
                        key={texto}
                        label={texto}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color: '#fff',
                          bgcolor: alpha('#fff', 0.18),
                          backdropFilter: 'blur(6px)',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row', md: 'column' }}
                  gap={1}
                  className="quadrante-sem-impressao"
                  sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
                >
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={baixarPdf}
                    disabled={baixando || !temEquipes}
                    sx={{
                      bgcolor: '#fff',
                      color: darken(paleta.primaria, 0.4),
                      fontWeight: 700,
                      '&:hover': { bgcolor: alpha('#fff', 0.88) },
                    }}
                  >
                    {baixando ? 'Gerando PDF...' : 'Baixar PDF'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={() => window.print()}
                    disabled={!temEquipes}
                    sx={{
                      color: '#fff',
                      borderColor: alpha('#fff', 0.6),
                      fontWeight: 700,
                      '&:hover': {
                        borderColor: '#fff',
                        bgcolor: alpha('#fff', 0.1),
                      },
                    }}
                  >
                    Imprimir
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {!temEquipes ? (
              <Typography sx={{ p: 4, textAlign: 'center' }}>
                Este evento ainda não possui equipes cadastradas.
              </Typography>
            ) : (
              <>
                <Stack
                  gap={1.5}
                  className="quadrante-sem-impressao"
                  sx={{ mb: 4 }}
                >
                  <TextField
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por nome, e-mail ou celular"
                    size="small"
                    sx={{ maxWidth: 480 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {data.teams.length > 1 && (
                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {data.teams.map((equipe, indice) => {
                        const { cor, texto } = paleta.daEquipe(indice);
                        return (
                          <Chip
                            key={equipe.id}
                            label={equipe.name}
                            onClick={() => irParaEquipe(equipe.id)}
                            sx={{
                              fontWeight: 700,
                              color: texto,
                              bgcolor: alpha(cor, 0.12),
                              '&:hover': { bgcolor: alpha(cor, 0.22) },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  )}
                </Stack>

                {equipesFiltradas.length ? (
                  <Stack gap={5}>
                    {equipesFiltradas.map(({ equipe, indice }) => {
                      const { cor, texto } = paleta.daEquipe(indice);
                      return (
                        <SecaoEquipe
                          key={equipe.id}
                          equipe={equipe}
                          cor={cor}
                          corTexto={texto}
                        />
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ p: 4, textAlign: 'center' }}
                  >
                    Ninguém encontrado para “{busca}”.
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </PageStyle>
  );
}

export { QuadrantePage };
