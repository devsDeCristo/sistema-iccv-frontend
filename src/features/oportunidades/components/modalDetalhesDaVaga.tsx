import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  alpha,
  Box,
  Button,
  darken,
  Dialog,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Close,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReactQuillViewer from '../../../components/reactQuill';
import { CORES_DO_MODULO } from '../../../constants/identidadeDosModulos';
import { descricaoEmHtml, formatarData, formatarSalario } from '../formulario';
import { legivelSobre, textoSobre } from '../corDaImagem';
import { OportunidadeDoMembro } from '../types';
import { LogoDaVaga } from './cardDaVaga';

/** Sem cor da logo (vaga sem imagem, ou logo preto e branco): a do módulo */
const COR_DO_MODULO = CORES_DO_MODULO.oportunidades.claro.terciaria;

/** Quantas linhas da descrição cabem na frente antes do "Ver mais" */
const LINHAS_NA_FRENTE = 5;
/** Corpo da descrição: 13px com entrelinha 1,5 */
const ALTURA_DA_LINHA = 13 * 1.5;
/** O vão entre as páginas do verso (as colunas do texto) */
const VAO_ENTRE_PAGINAS = 32;

/**
 * As cores do crachá: o papel é o fundo do modal no tema (o mesmo da
 * prancheta de Solicitações; um grafite fixo ficava cinza no escuro); fita e
 * destaques, a logo
 */
function usePaleta(cor: string | null | undefined) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const fita = cor ?? COR_DO_MODULO;
  const papel = theme.palette.background.paper;
  const texto = escuro ? '#EEF0F3' : '#16181D';
  return {
    escuro,
    fita,
    papel,
    texto,
    linha: alpha(texto, 0.16),
    // o título e os detalhes na cor da logo, ajustada até ler bem no papel
    tinta: legivelSobre(fita, papel),
    sobreAFita: textoSobre(fita),
  };
}
type Paleta = ReturnType<typeof usePaleta>;

/**
 * A descrição como foi escrita, com as linhas em branco: são as quebras que
 * quem escreveu deu ao texto (o verso pagina o que não couber)
 */
const descricaoDoCracha = (descricao: string) => descricaoEmHtml(descricao);

/** O visual do texto do Quill dentro do crachá (frente e verso) */
const textoDoQuill = (paleta: Paleta) => ({
  '& .ql-container.ql-snow, & .ql-toolbar': { border: 'none' },
  '& .viewer-rquil, & .ql-container': { minHeight: '0 !important' },
  '& .ql-editor': {
    p: 0,
    color: paleta.texto,
    fontSize: 13,
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  // o recuo das listas do Quill (3em) come a largura do crachá
  '& .ql-editor ol, & .ql-editor ul': { pl: 0, my: 0.5 },
  '& .ql-editor li:not(.ql-direction-rtl)': { pl: '1.1em' },
  '& .ql-editor li:not(.ql-direction-rtl)::before': {
    ml: '-1.1em',
    width: '0.9em',
    textAlign: 'left',
  },
  '& .ql-editor li::before': { color: paleta.tinta },
  '& .ql-editor a': { color: paleta.tinta },
});

/** Uma linha da ficha: rótulo à esquerda, valor à direita */
function Linha({
  rotulo,
  paleta,
  children,
}: {
  rotulo: string;
  paleta: Paleta;
  children: ReactNode;
}) {
  const estilo = {
    fontSize: 11.5,
    textTransform: 'uppercase',
    color: paleta.texto,
  } as const;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      gap={2}
      sx={{ py: 1, borderTop: `1px solid ${paleta.linha}` }}
    >
      <Typography sx={{ ...estilo, fontWeight: 800, letterSpacing: '0.04em' }}>
        {rotulo}
      </Typography>
      <Typography
        sx={{
          ...estilo,
          fontWeight: 700,
          textAlign: 'right',
          overflowWrap: 'anywhere',
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

/** A fita e o mosquetão que seguram o crachá */
function Fita({ cor }: { cor: string }) {
  return (
    <Stack
      alignItems="center"
      aria-hidden
      sx={{ mb: '-14px', position: 'relative', zIndex: 2 }}
    >
      <Box
        sx={{
          width: 30,
          height: 46,
          backgroundColor: cor,
          backgroundImage: `repeating-linear-gradient(0deg, transparent 0 6px, ${alpha('#000', 0.08)} 6px 7px)`,
          borderRadius: '0 0 4px 4px',
          boxShadow: `inset 3px 0 0 ${alpha('#fff', 0.18)}, inset -3px 0 0 ${alpha('#000', 0.12)}`,
        }}
      />
      <Box
        sx={{
          width: 26,
          height: 14,
          mt: '-4px',
          border: '4px solid #B8BDC6',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
        }}
      />
      <Box
        sx={{
          width: 14,
          height: 30,
          mt: '-2px',
          borderRadius: 6,
          background: 'linear-gradient(90deg, #8E949E, #E3E6EA 45%, #A2A8B1)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        }}
      />
    </Stack>
  );
}

/** O rasgo por onde passa o mosquetão, no alto das duas faces */
function Rasgo({ paleta }: { paleta: Paleta }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 64,
        height: 10,
        mx: 'auto',
        mb: 1.5,
        flexShrink: 0,
        borderRadius: 5,
        backgroundColor: paleta.escuro ? '#0B0C10' : alpha(paleta.texto, 0.22),
        boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.45)',
      }}
    />
  );
}

/** "VAGA" (ou outro letreiro) entre dois traços, na cor da logo */
function Letreiro({ paleta, children }: { paleta: Paleta; children: string }) {
  const traco = (
    <Box
      sx={{
        height: '2px',
        borderRadius: 1,
        backgroundColor: alpha(paleta.tinta, 0.35),
      }}
    />
  );
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 1.25,
      }}
    >
      {traco}
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 900,
          letterSpacing: '0.24em',
          color: paleta.tinta,
          // o espaçamento empurra a última letra: compensa à esquerda
          pl: '0.24em',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Typography>
      {traco}
    </Box>
  );
}

/**
 * O verso: a descrição inteira, em páginas do tamanho do crachá. O texto
 * corre em colunas CSS da largura da área (`column-width`), e cada página é
 * uma coluna — o navegador quebra o HTML onde cabe, sem cortar linha no meio.
 * Trocar de página desliza as colunas de lado.
 */
function DescricaoPaginada({ html, paleta }: { html: string; paleta: Paleta }) {
  const area = useRef<HTMLDivElement>(null);
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });
  const [paginas, setPaginas] = useState(1);
  const [pagina, setPagina] = useState(0);

  // a área tem a altura que sobra no verso (que tem a da frente)
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    const medir = () =>
      setTamanho({ largura: el.clientWidth, altura: el.clientHeight });
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // quantas colunas o texto ocupou com esse tamanho
  const contar = useCallback(() => {
    const editor = area.current?.querySelector<HTMLElement>('.ql-editor');
    if (!editor || !tamanho.largura) return;
    const passo = tamanho.largura + VAO_ENTRE_PAGINAS;
    const total = Math.max(
      1,
      Math.round((editor.scrollWidth + VAO_ENTRE_PAGINAS) / passo)
    );
    setPaginas(total);
    setPagina((atual) => Math.min(atual, total - 1));
  }, [tamanho]);

  useLayoutEffect(() => {
    contar();
    // o Quill monta o texto logo depois do primeiro desenho
    const espera = window.setTimeout(contar, 60);
    return () => window.clearTimeout(espera);
  }, [contar, html]);

  const passo = tamanho.largura + VAO_ENTRE_PAGINAS;

  return (
    <>
      <Box
        ref={area}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          ...textoDoQuill(paleta),
          '& .ql-container': {
            minHeight: '0 !important',
            height: 'auto',
            overflow: 'visible',
          },
          '& .ql-editor': {
            ...textoDoQuill(paleta)['& .ql-editor'],
            height: tamanho.altura ? `${tamanho.altura}px` : 'auto',
            overflow: 'visible',
            columnWidth: tamanho.largura ? `${tamanho.largura}px` : 'auto',
            columnGap: `${VAO_ENTRE_PAGINAS}px`,
            columnFill: 'auto',
            transform: `translateX(${-pagina * passo}px)`,
            transition: 'transform .35s ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          },
        }}
      >
        <ReactQuillViewer value={html} />
      </Box>

      {paginas > 1 && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1}
          sx={{ pt: 1, flexShrink: 0 }}
        >
          <IconButton
            size="small"
            aria-label="Página anterior"
            disabled={pagina === 0}
            onClick={() => setPagina((p) => p - 1)}
            sx={{ color: paleta.tinta }}
          >
            <ChevronLeft />
          </IconButton>
          <Typography
            aria-live="polite"
            sx={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: paleta.texto,
              minWidth: 48,
              textAlign: 'center',
            }}
          >
            {pagina + 1} / {paginas}
          </Typography>
          <IconButton
            size="small"
            aria-label="Próxima página"
            disabled={pagina >= paginas - 1}
            onClick={() => setPagina((p) => p + 1)}
            sx={{ color: paleta.tinta }}
          >
            <ChevronRight />
          </IconButton>
        </Stack>
      )}
    </>
  );
}

/** A descrição na frente, cortada em algumas linhas; diz se passou do corte */
function DescricaoCortada({
  html,
  paleta,
  cortada,
  onCortou,
}: {
  html: string;
  paleta: Paleta;
  cortada: boolean;
  onCortou: (cortou: boolean) => void;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const limite = LINHAS_NA_FRENTE * ALTURA_DA_LINHA;

  useEffect(() => {
    const editor = caixa.current?.querySelector<HTMLElement>('.ql-editor');
    if (!editor) return;
    const conferir = () => onCortou(editor.scrollHeight > limite + 2);
    conferir();
    const observador = new ResizeObserver(conferir);
    observador.observe(editor);
    return () => observador.disconnect();
  }, [html, limite, onCortou]);

  return (
    <Box
      ref={caixa}
      sx={{
        maxHeight: limite,
        overflow: 'hidden',
        // cortada, a última linha esmaece, dizendo que o texto continua
        ...(cortada && {
          maskImage: `linear-gradient(#000 ${limite - ALTURA_DA_LINHA}px, transparent)`,
          WebkitMaskImage: `linear-gradient(#000 ${limite - ALTURA_DA_LINHA}px, transparent)`,
        }),
        ...textoDoQuill(paleta),
      }}
    >
      <ReactQuillViewer value={html} />
    </Box>
  );
}

/** O que as duas faces do crachá têm em comum: o papel e a borda */
const face = (paleta: Paleta): SxProps<Theme> => ({
  backgroundColor: paleta.papel,
  color: paleta.texto,
  borderRadius: '16px',
  px: { xs: 2.25, sm: 2.75 },
  pt: 2.25,
  pb: 2.25,
  border: paleta.escuro ? `1px solid ${alpha('#fff', 0.08)}` : 'none',
  boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
});

/**
 * O crachá de uma vaga, com frente e verso. Fica num componente à parte,
 * com `key` da vaga: abrir outra começa de novo, na frente e na página 1.
 */
function Cracha({
  vaga,
  onClose,
}: {
  vaga: OportunidadeDoMembro;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const paleta = usePaleta(vaga.cor);
  const salario = formatarSalario(vaga.salario);
  const { fita, texto, linha, tinta, sobreAFita } = paleta;
  const html = descricaoDoCracha(vaga.description);
  const [virado, setVirado] = useState(false);
  const [cortou, setCortou] = useState(false);

  const fechar = (
    <IconButton
      onClick={onClose}
      aria-label="Fechar"
      size="small"
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        color: alpha(texto, 0.6),
        '&:hover': { color: texto, backgroundColor: linha },
      }}
    >
      <Close fontSize="small" />
    </IconButton>
  );

  // a face escondida sai do teclado e do leitor de tela
  const escondida = (sim: boolean) =>
    sim ? { inert: '', 'aria-hidden': true } : {};

  return (
    // o par fica centrado: o da frente vai um pouco para a esquerda
    <Box sx={{ position: 'relative', left: { sm: '-7%' } }}>
      {/*
        o segundo crachá, do tamanho do da frente (a mesma caixa, abaixo da
        fita, que fica em 70px), inclinado atrás dele e só com o nome. No
        celular não cabe ao lado e some.
      */}
      <Box
        aria-hidden
        sx={{
          display: { xs: 'none', sm: 'flex' },
          position: 'absolute',
          top: 70,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: '16px',
          backgroundColor: fita,
          backgroundImage: `linear-gradient(160deg, ${alpha('#fff', 0.12)}, transparent 50%, ${alpha('#000', 0.16)})`,
          transformOrigin: 'top center',
          // meio escondido, como a pasta atrás da prancheta
          transform: 'translateX(18%) rotate(6deg)',
          boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pr: 2,
          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{
            writingMode: 'vertical-rl',
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '0.04em',
            // a cor da fita, escurecida: marca d'água
            color: darken(fita, 0.28),
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Oportunidade
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'relative',
          transformOrigin: 'top center',
          '@keyframes balancarCracha': {
            '0%': { transform: 'rotate(2.5deg)' },
            '35%': { transform: 'rotate(-1.6deg)' },
            '65%': { transform: 'rotate(0.8deg)' },
            '100%': { transform: 'rotate(0deg)' },
          },
          animation: 'balancarCracha 1.1s ease-out',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        <Fita cor={fita} />

        {/* frente e verso giram juntos; a fita fica parada em cima */}
        <Box sx={{ perspective: '1400px' }}>
          <Box
            sx={{
              position: 'relative',
              transformStyle: 'preserve-3d',
              transition: 'transform .6s cubic-bezier(.3,.7,.3,1)',
              transform: virado ? 'rotateY(180deg)' : 'none',
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            }}
          >
            {/* ---- frente ---- */}
            <Box
              component="article"
              aria-label={`Vaga: ${vaga.title}`}
              {...escondida(virado)}
              sx={{ ...face(paleta), position: 'relative' }}
            >
              {fechar}
              <Rasgo paleta={paleta} />

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={1}
                sx={{ mb: 1.25 }}
              >
                <LogoDaVaga vaga={vaga} tamanho={36} />
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                    maxWidth: 220,
                  }}
                >
                  {vaga.company}
                </Typography>
              </Stack>

              {/* a chamada numa linha só, como o letreiro do crachá */}
              <Typography
                component="p"
                sx={{
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1,
                  letterSpacing: '-0.015em',
                  textTransform: 'uppercase',
                }}
              >
                {vaga.encerrada ? 'Vaga encerrada' : 'Estamos contratando!'}
              </Typography>

              <Box sx={{ mt: 1.5, mb: 0.5 }}>
                <Letreiro paleta={paleta}>Vaga</Letreiro>
              </Box>

              <Typography
                component="h2"
                sx={{
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: { xs: 22, sm: 26 },
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  textWrap: 'balance',
                  overflowWrap: 'anywhere',
                  color: tinta,
                  mb: 1.25,
                }}
              >
                {vaga.title}
              </Typography>

              <DescricaoCortada
                html={html}
                paleta={paleta}
                cortada={cortou}
                onCortou={setCortou}
              />
              {cortou && (
                <Button
                  size="small"
                  endIcon={<ChevronRight />}
                  onClick={() => setVirado(true)}
                  sx={{
                    mt: 0.25,
                    mb: 0.75,
                    px: 0.5,
                    minWidth: 0,
                    color: tinta,
                    fontWeight: 800,
                    textTransform: 'none',
                  }}
                >
                  Ver mais
                </Button>
              )}

              <Box sx={{ mt: cortou ? 0 : 1.5 }}>
                {vaga.location && (
                  <Linha rotulo="Local" paleta={paleta}>
                    {vaga.location}
                  </Linha>
                )}
                {salario && (
                  <Linha rotulo="Salário" paleta={paleta}>
                    {salario}
                  </Linha>
                )}
                <Linha rotulo="Candidaturas até" paleta={paleta}>
                  {vaga.closesAt ? formatarData(vaga.closesAt) : 'Sem data'}
                </Linha>
                <Linha rotulo="Publicada em" paleta={paleta}>
                  {formatarData(vaga.createdAt)}
                </Linha>
              </Box>

              {(vaga.interessei || !vaga.encerrada) && (
                <Button
                  fullWidth
                  variant={vaga.interessei ? 'outlined' : 'contained'}
                  startIcon={vaga.interessei ? <CheckCircle /> : undefined}
                  onClick={() =>
                    navigate(`/oportunidades/${vaga.id}/candidatura`)
                  }
                  sx={{
                    mt: 1.5,
                    py: 1,
                    borderRadius: 999,
                    fontWeight: 800,
                    textTransform: 'none',
                    ...(vaga.interessei
                      ? {
                          color: tinta,
                          borderColor: alpha(tinta, 0.5),
                          '&:hover': {
                            borderColor: tinta,
                            backgroundColor: alpha(tinta, 0.08),
                          },
                        }
                      : {
                          color: sobreAFita,
                          backgroundColor: fita,
                          boxShadow: `0 8px 20px -6px ${alpha(fita, 0.6)}`,
                          '&:hover': { backgroundColor: darken(fita, 0.12) },
                        }),
                  }}
                >
                  {vaga.interessei ? 'Ver candidatura' : 'Candidatar-me'}
                </Button>
              )}
            </Box>

            {/* ---- verso: a descrição inteira, em páginas ---- */}
            <Box
              component="section"
              aria-label={`Descrição da vaga ${vaga.title}`}
              {...escondida(!virado)}
              sx={{
                ...face(paleta),
                position: 'absolute',
                inset: 0,
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {fechar}
              <Rasgo paleta={paleta} />
              <Box sx={{ flexShrink: 0, mb: 1.25 }}>
                <Letreiro paleta={paleta}>Sobre a vaga</Letreiro>
                <Typography
                  sx={{
                    mt: 0.75,
                    textAlign: 'center',
                    fontWeight: 900,
                    fontSize: 15,
                    lineHeight: 1.2,
                    textTransform: 'uppercase',
                    color: tinta,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {vaga.title}
                </Typography>
              </Box>

              <DescricaoPaginada html={html} paleta={paleta} />

              <Button
                fullWidth
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => setVirado(false)}
                sx={{
                  mt: 1.25,
                  py: 0.9,
                  flexShrink: 0,
                  borderRadius: 999,
                  fontWeight: 800,
                  textTransform: 'none',
                  color: tinta,
                  borderColor: alpha(tinta, 0.5),
                  '&:hover': {
                    borderColor: tinta,
                    backgroundColor: alpha(tinta, 0.08),
                  },
                }}
              >
                Voltar ao crachá
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Os detalhes de uma vaga como um crachá de "estamos contratando", no lugar
 * do modal: só o crachá sobre o fundo escurecido, com o botão dentro. Fecha
 * no X, no Esc ou clicando fora.
 *
 * A descrição aparece cortada na frente; "Ver mais" vira o crachá, e o verso
 * mostra o texto inteiro em páginas do tamanho dele.
 *
 * O papel acompanha o tema (claro ou escuro) e a fita, o título e o botão
 * pegam a cor da logo (`vaga.cor`, tirada quando o admin sobe a imagem),
 * ajustada para ler bem no papel.
 */
export function ModalDetalhesDaVaga({
  vaga,
  onClose,
}: {
  vaga: OportunidadeDoMembro | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!vaga}
      onClose={onClose}
      scroll="body"
      // o crachá de trás passa da caixa do Dialog: sem rolagem de lado
      sx={{ '& .MuiDialog-container': { overflowX: 'hidden' } }}
      maxWidth={false}
      aria-label={vaga ? `Vaga: ${vaga.title}` : undefined}
      PaperProps={{
        sx: {
          // o Dialog é só o lugar: quem aparece é o crachá
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          m: { xs: 2, sm: 4 },
        },
      }}
    >
      {vaga && <Cracha key={vaga.id} vaga={vaga} onClose={onClose} />}
    </Dialog>
  );
}
