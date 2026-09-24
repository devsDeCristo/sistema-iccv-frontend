import { memo, ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  darken,
  getContrastRatio,
  GlobalStyles,
  InputAdornment,
  lighten,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonthOutlined,
  Download,
  GroupsOutlined,
  PersonOutline,
  Search,
} from '@mui/icons-material';
import FileSaver from 'file-saver';
import { toast } from 'react-toastify';
import { PageStyle } from '../pageStyle';
import { apiClient } from '../../config/lib/axios/api-client';
import { useGetQuadrante } from '../../features/admin/events/api/getQuadrante';
import { QuadranteData } from '../../features/admin/events/types';
import { ehCorHex } from '../../features/admin/events/eventColors';
import { AZUL_VIVO, sombraSuperficie, VIOLETA_VIVO } from '../../themes';
import CapaPadrao from '../../assets/capaLogin2.jpg';

type Equipe = QuadranteData['teams'][number];
type Pessoa = Equipe['users'][number];

/** Mais arredondada que a Roboto do sistema: o quadrante é para folhear. */
const FONTE = '"Nunito", "Roboto", "Helvetica", sans-serif';

/** Mesmo número da página do evento: quanto as fichas sobem sobre o cartaz. */
const SOBREPOSICAO_DAS_FICHAS = 7;

/**
 * Fundo dos cartões em cada tema (`background.paper` de `themes/index.tsx`).
 * O tom legível de cada cor é calculado contra os dois de uma vez, para os
 * cartões não dependerem do tema — ver `QuadrantePage`.
 */
const PAPEL_CLARO = '#F8F8F8';
const PAPEL_ESCURO = '#0F172A';

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
 * A cor do evento num tom que dá para ler sobre o fundo.
 *
 * A paleta sai da logo e da capa, então pode ser qualquer coisa — um amarelo
 * some no papel claro, um azul-marinho some no modo escuro. Clareia ou
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

type CorDaEquipe = { cor: string; textoClaro: string; textoEscuro: string };

/** As três cores do evento, com o tom legível de cada uma nos dois temas. */
function montarPaleta(cores?: QuadranteData['event']['colors']) {
  const primaria = ehCorHex(cores?.primary) ? cores!.primary! : AZUL_VIVO;
  const secundaria = ehCorHex(cores?.secondary)
    ? cores!.secondary!
    : ehCorHex(cores?.primary)
      ? primaria
      : VIOLETA_VIVO;
  const terciaria = ehCorHex(cores?.tertiary) ? cores!.tertiary! : primaria;

  const porEquipe: CorDaEquipe[] = [primaria, secundaria, terciaria].map(
    (cor) => ({
      cor,
      textoClaro: corLegivel(cor, PAPEL_CLARO, false),
      textoEscuro: corLegivel(cor, PAPEL_ESCURO, true),
    })
  );

  return {
    primaria,
    secundaria,
    terciaria,
    /** cor de destaque de cada equipe: as três da paleta, em rodízio */
    daEquipe: (indice: number) => porEquipe[indice % porEquipe.length],
  };
}

/**
 * Ícones dos cartões em SVG puro, e não `@mui/icons-material`: cada ícone do
 * MUI lê o tema, e com centenas de cartões na tela eram milhares de
 * componentes re-renderizando a cada troca de claro para escuro.
 */
const ICONES = {
  celular:
    'M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1m-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m4.5-4H7V4h9z',
  email:
    'M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0-8 5-8-5zm0 12H4V8l8 5 8-5z',
  bolo: 'M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2m6 3h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v9c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-9c0-1.66-1.34-3-3-3m1 11H5v-3c.9-.01 1.76-.37 2.4-1.01l1.09-1.07 1.07 1.07c1.31 1.31 3.59 1.3 4.89 0l1.08-1.07 1.07 1.07c.64.64 1.5 1 2.4 1.01zm0-4.5c-.51-.01-.99-.2-1.35-.57l-2.13-2.13-2.14 2.13c-.74.74-2.03.74-2.77 0L8.48 12.8l-2.14 2.13c-.35.36-.83.56-1.34.57V12c0-.55.45-1 1-1h12c.55 0 1 .45 1 1z',
  estrela:
    'm12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08z',
  whatsapp:
    'M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z',
};

function Icone({ nome }: { nome: keyof typeof ICONES }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="q-icone">
      <path d={ICONES[nome]} fill="currentColor" />
    </svg>
  );
}

function Foto({ pessoa }: { pessoa: Pessoa }) {
  // foto ausente e foto que falha no download caem nas iniciais, em vez do
  // ícone de imagem quebrada
  const [falhou, setFalhou] = useState(false);

  return (
    <div className="q-foto">
      {pessoa.profilePhotoUrl && !falhou ? (
        <img
          src={pessoa.profilePhotoUrl}
          alt=""
          loading="lazy"
          onError={() => setFalhou(true)}
        />
      ) : (
        iniciais(pessoa.fullName)
      )}
    </div>
  );
}

function CartaoPessoa({ pessoa }: { pessoa: Pessoa }) {
  const lider = pessoa.roleTeam === 'LEADER';
  const whatsapp = linkWhatsApp(pessoa.cellphone);

  return (
    <article className={`q-cartao${lider ? ' q-lider' : ''}`}>
      <div className="q-topo">
        <Foto pessoa={pessoa} />
        <div className="q-identidade">
          <div className="q-nome">{pessoa.fullName}</div>
          {lider && (
            <span className="q-selo-lider">
              <Icone nome="estrela" />
              Líder
            </span>
          )}
        </div>
      </div>

      <div className="q-contatos">
        <div className="q-linha">
          <Icone nome="celular" />
          <a href={`tel:${soDigitos(pessoa.cellphone)}`} title="Ligar">
            {formatarCelular(pessoa.cellphone)}
          </a>
          {whatsapp && (
            <a
              className="q-whatsapp q-sem-impressao"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Conversar no WhatsApp"
              aria-label={`WhatsApp de ${pessoa.fullName}`}
            >
              <Icone nome="whatsapp" />
            </a>
          )}
        </div>
        <div className="q-linha">
          <Icone nome="email" />
          <a href={`mailto:${pessoa.email}`} title={pessoa.email}>
            {pessoa.email}
          </a>
        </div>
        <div className="q-linha" title="Aniversário">
          <Icone nome="bolo" />
          <span>{formatarAniversario(pessoa.birthday)}</span>
        </div>
      </div>
    </article>
  );
}

/**
 * Uma equipe inteira, fora do alcance do tema.
 *
 * Só recebe texto e cor fixa, e é HTML puro: trocar entre claro e escuro não
 * re-renderiza nada daqui — quem muda é a folha de estilo do `QuadrantePage`,
 * que redefine as variáveis CSS que estes elementos leem.
 */
const SecaoEquipe = memo(function SecaoEquipe({
  equipe,
  cor,
}: {
  equipe: Equipe;
  cor: CorDaEquipe;
}) {
  const total = equipe.users.length;

  return (
    <section
      id={`equipe-${equipe.id}`}
      className="q-equipe"
      style={
        {
          '--cor': cor.cor,
          '--cor-texto-claro': cor.textoClaro,
          '--cor-texto-escuro': cor.textoEscuro,
        } as React.CSSProperties
      }
    >
      <div className="q-titulo">
        <span className="q-risco" />
        <h2>{equipe.name}</h2>
        <span className="q-contador">
          {total} {total === 1 ? 'pessoa' : 'pessoas'}
        </span>
      </div>

      <div className="q-grade">
        {equipe.users.map((pessoa) => (
          <CartaoPessoa key={pessoa.id} pessoa={pessoa} />
        ))}
      </div>
    </section>
  );
});

function Ficha({
  icone,
  rotulo,
  valor,
  cor,
}: {
  icone: ReactNode;
  rotulo: string;
  valor: string;
  cor: string;
}) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        backgroundColor: alpha(theme.palette.background.paper, 0.86),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.common.white, escuro ? 0.12 : 0.6)}`,
        boxShadow: `0 12px 28px -22px ${alpha('#000', 0.55)}`,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          color: corLegivel(cor, escuro ? PAPEL_ESCURO : PAPEL_CLARO, escuro),
          backgroundColor: alpha(cor, 0.12),
        }}
      >
        {icone}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          {rotulo}
        </Typography>
        <Typography fontWeight={700} sx={{ lineHeight: 1.3 }}>
          {valor}
        </Typography>
      </Box>
    </Paper>
  );
}

/**
 * Impressão: sai o quadrante, não a tela. Esconder tudo e revelar só o bloco
 * imprimível é o que funciona com o menu e o cabeçalho do sistema em volta.
 * No papel o modo escuro não faz sentido — tudo volta para fundo branco.
 */
const ESTILOS_DE_IMPRESSAO = {
  '@media print': {
    'body *': { visibility: 'hidden' },
    '#quadrante-impressao, #quadrante-impressao *': { visibility: 'visible' },
    '#quadrante-impressao .q-sem-impressao': { display: 'none !important' },
    // sem a capa, a subida das fichas sobre ela jogaria o topo para fora da folha
    '#quadrante-impressao .q-corpo': { marginTop: '0 !important' },
    '#quadrante-impressao .q-so-impressao': {
      display: 'block !important',
      marginBottom: '16px',
      '& h1': { margin: 0, fontSize: '22px' },
      '& p': { margin: '2px 0 0', color: '#555' },
    },
    '#quadrante-impressao': {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      printColorAdjust: 'exact',
      WebkitPrintColorAdjust: 'exact',
      '--q-papel': '#fff',
      '--q-texto': '#000',
      '--q-texto-2': '#333',
      '--q-sombra': '0 0 0 1px #bbb',
    },
    '#quadrante-impressao .q-equipe': {
      '--cor-texto': 'var(--cor-texto-claro)',
    },
    '#quadrante-impressao .q-grade': {
      gridTemplateColumns: 'repeat(4, 1fr) !important',
      gap: '8px !important',
    },
    '#quadrante-impressao .q-cartao': { breakInside: 'avoid' },
    '#quadrante-impressao .q-titulo': { breakAfter: 'avoid' },
    '@page': { size: 'A4 landscape', margin: '10mm' },
  },
} as const;

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
 * A capa segue o cartaz da página do evento (`pages/events/details`), para as
 * duas telas parecerem do mesmo evento.
 *
 * Serve o painel e a área do usuário; quem pode abrir é o servidor que decide.
 */
function QuadrantePage({ eventId, pageBack }: QuadrantePageProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const escuro = theme.palette.mode === 'dark';
  const fundo = theme.palette.background.default;
  const [baixando, setBaixando] = useState(false);
  const [busca, setBusca] = useState('');

  const { data, isLoading, isError } = useGetQuadrante(
    { eventId },
    { enabled: !!eventId, retry: false }
  );

  const paleta = useMemo(() => montarPaleta(data?.event.colors), [data]);

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
  const temLogo = !!data?.event.logoUrl;

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
   * A única coisa que depende do tema. As equipes e os cartões leem estas
   * variáveis; trocar o tema troca esta folha e o navegador repinta, sem o
   * React tocar em cartão nenhum.
   */
  const folhaSx = useMemo(
    () => ({
      fontFamily: FONTE,
      '& .MuiTypography-root, & .MuiButtonBase-root, & .MuiInputBase-root, & .MuiChip-label':
        {
          // fontFamily: FONTE
        },

      '--q-papel': theme.palette.background.paper,
      '--q-texto': theme.palette.text.primary,
      '--q-texto-2': theme.palette.text.secondary,
      '--q-sombra': sombraSuperficie(escuro),
      '--q-fundo-suave': escuro ? '30%' : '15%',

      '& .q-so-impressao': { display: 'none' },
      '& .q-equipe': {
        '--cor-texto': escuro
          ? 'var(--cor-texto-escuro)'
          : 'var(--cor-texto-claro)',
        scrollMarginTop: 24,
      },
      '& .q-titulo': {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2,
        '& h2': {
          m: 0,
          fontWeight: 800,
          fontSize: { xs: 20, sm: 24 },
          lineHeight: 1.2,
          color: 'var(--q-texto)',
        },
      },
      '& .q-risco': {
        width: 6,
        alignSelf: 'stretch',
        minHeight: 32,
        borderRadius: 3,
        background:
          'linear-gradient(180deg, var(--cor), color-mix(in srgb, var(--cor) 40%, transparent))',
      },
      '& .q-contador': {
        px: 1.25,
        py: 0.25,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--cor-texto)',
        backgroundColor: 'color-mix(in srgb, var(--cor) 14%, transparent)',
      },
      '& .q-grade': {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 2,
      },
      '& .q-cartao': {
        position: 'relative',
        p: 2,
        pt: 2.5,
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        color: 'var(--q-texto)',
        backgroundColor: 'var(--q-papel)',
        boxShadow: 'var(--q-sombra)',
        transition: 'transform .15s ease, box-shadow .15s ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '0 0 auto 0',
          height: 4,
          background:
            'linear-gradient(90deg, var(--cor), color-mix(in srgb, var(--cor) 35%, transparent))',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow:
            '0 12px 24px -10px color-mix(in srgb, var(--cor) 50%, transparent)',
        },
      },
      // o líder se destaca pela moldura na cor da equipe
      '& .q-lider, & .q-lider:hover': {
        boxShadow:
          '0 0 0 2px color-mix(in srgb, var(--cor) 80%, transparent), var(--q-sombra)',
      },
      '& .q-topo': {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 0,
      },
      '& .q-foto': {
        width: 64,
        height: 64,
        flexShrink: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--cor-texto)',
        backgroundColor:
          'color-mix(in srgb, var(--cor) var(--q-fundo-suave), var(--q-papel))',
        boxShadow:
          '0 0 0 3px var(--q-papel), 0 0 0 5px color-mix(in srgb, var(--cor) 55%, transparent)',
        '& img': {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        },
      },
      '& .q-identidade': { minWidth: 0 },
      '& .q-nome': { fontWeight: 800, fontSize: 16, lineHeight: 1.25 },
      '& .q-selo-lider': {
        mt: 0.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        height: 22,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--cor-texto)',
        backgroundColor: 'color-mix(in srgb, var(--cor) 16%, transparent)',
        '& .q-icone': { width: 16, height: 16, color: 'inherit' },
      },
      '& .q-contatos': {
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        minWidth: 0,
      },
      '& .q-linha': {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        fontSize: 14,
        '& > a:not(.q-whatsapp), & > span': {
          color: 'var(--q-texto)',
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flexGrow: 1,
          minWidth: 0,
        },
        '& > a:not(.q-whatsapp):hover': { textDecoration: 'underline' },
      },
      '& .q-icone': {
        width: 20,
        height: 20,
        flexShrink: 0,
        color: 'var(--q-texto-2)',
      },
      '& .q-whatsapp': {
        display: 'grid',
        placeItems: 'center',
        width: 30,
        height: 30,
        my: -0.5,
        borderRadius: '50%',
        flexShrink: 0,
        '& .q-icone': { color: '#25D366' },
        '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.12)' },
      },
    }),
    [theme, escuro]
  );

  /**
   * Cartaz no mesmo desenho da página do evento: sangra até a borda, foto
   * escurecida por baixo, véu que vira fundo da página no rodapé, e as fichas
   * subindo por cima da virada.
   */
  const cartazSx = {
    position: 'relative',
    mx: -4,
    mt: -4,
    minHeight: { xs: 380, sm: 420, md: 440 },
    display: 'flex',
    alignItems: temLogo ? 'flex-end' : 'center',
    overflow: 'hidden',
  } as const;

  // const vidroSx = {
  //   height: 50,
  //   px: 3,
  //   borderRadius: 999,
  //   textTransform: 'none',
  //   fontWeight: 600,
  //   color: '#fff',
  //   borderColor: alpha('#fff', 0.5),
  //   backgroundColor: alpha('#000', 0.2),
  //   backdropFilter: 'blur(6px)',
  //   '&:hover': {
  //     borderColor: '#fff',
  //     backgroundColor: alpha('#000', 0.35),
  //   },
  // } as const;

  const seloSx = {
    px: 1.25,
    py: 0.4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#fff',
    backgroundColor: alpha('#fff', 0.18),
    border: `1px solid ${alpha('#fff', 0.35)}`,
    backdropFilter: 'blur(6px)',
    whiteSpace: 'nowrap',
  } as const;

  const botaoVoltar = (
    <Button
      startIcon={<ArrowBack />}
      aria-label="Voltar"
      onClick={() => navigate(pageBack)}
      className="q-sem-impressao"
      sx={{
        position: 'absolute',
        top: { xs: 32, sm: 40 },
        left: 'max(32px, calc((100% - 1200px) / 2))',
        zIndex: 2,
        minWidth: 'auto',
        px: 1.5,
        py: 0.75,
        borderRadius: 1.5,
        fontSize: '1rem',
        color: '#fff',
        textTransform: 'none',
        backgroundColor: alpha('#000', 0.28),
        backdropFilter: 'blur(6px)',
        '&:hover': { color: '#fff', backgroundColor: alpha('#000', 0.5) },
      }}
    >
      Voltar
    </Button>
  );

  if (isLoading || isError || !data) {
    return (
      <PageStyle>
        <Box sx={{ ...cartazSx, backgroundColor: 'action.hover' }}>
          {botaoVoltar}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Typography>
              O quadrante deste evento não está disponível.
            </Typography>
          )}
        </Box>
      </PageStyle>
    );
  }

  return (
    <PageStyle>
      <GlobalStyles styles={ESTILOS_DE_IMPRESSAO} />

      <Box id="quadrante-impressao" sx={folhaSx}>
        <Box sx={cartazSx} className="q-sem-impressao">
          {botaoVoltar}
          <Box
            role="img"
            aria-label={`Capa de ${data.event.name}`}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundImage: `url("${data.event.coverUrl || CapaPadrao}")`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: alpha('#000', 0.38),
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(180deg, transparent 38%, ${alpha(
                fundo,
                0.22
              )} 66%, ${alpha(fundo, 0.62)} 86%, ${fundo} 100%)`,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: 'calc(100% - 64px)',
              maxWidth: 1200,
              mx: 'auto',
              pt: { xs: 11, md: 12 },
              pb: temLogo
                ? {
                    xs: 6 + SOBREPOSICAO_DAS_FICHAS,
                    md: 8 + SOBREPOSICAO_DAS_FICHAS,
                  }
                : {
                    xs: 11 + SOBREPOSICAO_DAS_FICHAS,
                    md: 12 + SOBREPOSICAO_DAS_FICHAS,
                  },
            }}
          >
            {temLogo && (
              <Box
                component="img"
                src={data.event.logoUrl!}
                alt={`Logo de ${data.event.name}`}
                sx={{
                  maxHeight: { xs: 72, sm: 96 },
                  maxWidth: '60%',
                  objectFit: 'contain',
                  mb: 0.5,
                  filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))',
                }}
              />
            )}

            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
              <Box sx={seloSx}>Quadrante</Box>
            </Stack>

            <Typography
              component="h1"
              sx={{
                color: '#fff',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.4rem' },
                textShadow: '0 2px 18px rgba(0,0,0,0.45)',
                maxWidth: 760,
              }}
            >
              {data.event.name}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              gap={1.5}
              sx={{ mt: 2.5 }}
            >
              <Button
                startIcon={<Download />}
                onClick={baixarPdf}
                disabled={baixando || !temEquipes}
                sx={{
                  height: 50,
                  px: 3.5,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#fff',
                  backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
                  boxShadow: `0 10px 30px -6px ${alpha('#fff', 0.5)}`,
                  transition: theme.transitions.create(
                    ['transform', 'box-shadow'],
                    { duration: 220 }
                  ),
                  '&:hover, &:focus-visible': {
                    transform: 'scale(1.035)',
                    boxShadow: `0 14px 38px -6px ${alpha('#fff', 0.65)}`,
                  },
                  '&.Mui-disabled': { color: alpha('#fff', 0.7) },
                }}
              >
                {baixando ? 'Gerando PDF...' : 'Baixar PDF'}
              </Button>
              {/* <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => window.print()}
                disabled={!temEquipes}
                sx={vidroSx}
              >
                Imprimir
              </Button> */}
            </Stack>
          </Box>
        </Box>

        <Box
          className="q-corpo"
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            mt: -SOBREPOSICAO_DAS_FICHAS,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            className="q-sem-impressao"
            sx={{
              display: 'grid',
              gap: 1.25,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            }}
          >
            <Ficha
              icone={<CalendarMonthOutlined fontSize="small" />}
              rotulo="Quando"
              valor={data.event.periodo}
              cor={paleta.primaria}
            />
            <Ficha
              icone={<GroupsOutlined fontSize="small" />}
              rotulo="Equipes"
              valor={`${data.teams.length} ${data.teams.length === 1 ? 'equipe' : 'equipes'}`}
              cor={paleta.secundaria}
            />
            <Ficha
              icone={<PersonOutline fontSize="small" />}
              rotulo="Pessoas"
              valor={`${totalPessoas} ${totalPessoas === 1 ? 'pessoa' : 'pessoas'}`}
              cor={paleta.terciaria}
            />
          </Box>

          {/* no papel a capa não sai: o nome e o período vão no topo */}
          <div className="q-so-impressao">
            <h1>{data.event.name}</h1>
            <p>{data.event.periodo}</p>
          </div>

          {!temEquipes ? (
            <Typography sx={{ p: 4, textAlign: 'center' }}>
              Este evento ainda não possui equipes cadastradas.
            </Typography>
          ) : (
            <>
              <Stack
                gap={1.5}
                className="q-sem-impressao"
                sx={{ mt: { xs: 4, md: 5 }, mb: 4 }}
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
                      const { cor, textoClaro, textoEscuro } =
                        paleta.daEquipe(indice);
                      return (
                        <Chip
                          key={equipe.id}
                          label={equipe.name}
                          onClick={() => irParaEquipe(equipe.id)}
                          sx={{
                            fontWeight: 700,
                            color: escuro ? textoEscuro : textoClaro,
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
                  {equipesFiltradas.map(({ equipe, indice }) => (
                    <SecaoEquipe
                      key={equipe.id}
                      equipe={equipe}
                      cor={paleta.daEquipe(indice)}
                    />
                  ))}
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
      </Box>
    </PageStyle>
  );
}

export { QuadrantePage };
