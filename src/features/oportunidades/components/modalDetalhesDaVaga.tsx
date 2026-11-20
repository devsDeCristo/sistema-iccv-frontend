import { ReactNode } from 'react';
import {
  alpha,
  Box,
  Button,
  darken,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReactQuillViewer from '../../../components/reactQuill';
import { CORES_DO_MODULO } from '../../../constants/identidadeDosModulos';
import { descricaoEmHtml, formatarData, formatarSalario } from '../formulario';
import { legivelSobre, textoSobre } from '../corDaImagem';
import { OportunidadeDoMembro } from '../types';
import { LogoDaVaga } from './cardDaVaga';

/** Sem cor da logo (vaga sem imagem, ou logo preto e branco): a do módulo */
const COR_DO_MODULO = CORES_DO_MODULO.oportunidades.claro.terciaria;

/** As cores do crachá: o papel segue o tema; fita e destaques, a logo */
function usePaleta(cor: string | null | undefined) {
  const escuro = useTheme().palette.mode === 'dark';
  const fita = cor ?? COR_DO_MODULO;
  const papel = escuro ? '#1A1D24' : '#F5F3EE';
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

/**
 * Os detalhes de uma vaga como um crachá de "estamos contratando", no lugar
 * do modal: só o crachá sobre o fundo escurecido, com o botão dentro. Fecha
 * no X, no Esc ou clicando fora.
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
  const navigate = useNavigate();
  const paleta = usePaleta(vaga?.cor);
  const salario = formatarSalario(vaga?.salario);
  const { fita, papel, texto, linha, tinta, sobreAFita } = paleta;

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
      {vaga && (
        // o par fica centrado: o da frente vai um pouco para a esquerda
        <Box sx={{ position: 'relative', left: { sm: '-9%' } }}>
          {/*
            o segundo crachá, do tamanho do da frente (a mesma caixa, abaixo
            da fita, que fica em 70px), inclinado atrás dele e só com o nome.
            No celular não cabe ao lado e some.
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
              transform: 'translateX(24%) rotate(7deg)',
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
                color: alpha(sobreAFita, 0.9),
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
            <Box
              component="article"
              sx={{
                position: 'relative',
                backgroundColor: papel,
                color: texto,
                borderRadius: '16px',
                px: { xs: 2.5, sm: 3 },
                pt: 3,
                pb: 2.5,
                border: paleta.escuro
                  ? `1px solid ${alpha('#fff', 0.08)}`
                  : 'none',
                boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
              }}
            >
              <IconButton
                onClick={onClose}
                aria-label="Fechar"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: alpha(texto, 0.6),
                  '&:hover': { color: texto, backgroundColor: linha },
                }}
              >
                <Close fontSize="small" />
              </IconButton>

              {/* o rasgo por onde passa o mosquetão */}
              <Box
                sx={{
                  width: 64,
                  height: 10,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: 5,
                  backgroundColor: paleta.escuro
                    ? '#0B0C10'
                    : alpha(texto, 0.22),
                  boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.45)',
                }}
              />

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={1.25}
                sx={{ mb: 1.5 }}
              >
                <LogoDaVaga vaga={vaga} tamanho={44} />
                <Typography
                  sx={{
                    fontSize: 15,
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

              <Typography
                component="p"
                sx={{
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: { xs: 24, sm: 28 },
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {vaga.encerrada ? 'Vaga' : 'Estamos'}
                <br />
                {vaga.encerrada ? 'encerrada' : 'contratando!'}
              </Typography>

              {/* "VAGA" entre dois traços, como o "POSITION" do crachá */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 1,
                  mt: 2,
                  mb: 1,
                }}
              >
                <Box sx={{ height: '1px', backgroundColor: linha }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    px: 1.5,
                    py: 0.25,
                    border: `1px solid ${linha}`,
                  }}
                >
                  VAGA
                </Typography>
                <Box sx={{ height: '1px', backgroundColor: linha }} />
              </Box>

              <Typography
                component="h2"
                sx={{
                  textAlign: 'center',
                  fontWeight: 900,
                  fontSize: { xs: 24, sm: 28 },
                  lineHeight: 1.05,
                  textTransform: 'uppercase',
                  color: tinta,
                  mb: 1.5,
                }}
              >
                {vaga.title}
              </Typography>

              <Box
                sx={{
                  mb: 1.5,
                  '& .ql-container.ql-snow, & .ql-toolbar': { border: 'none' },
                  '& .viewer-rquil, & .ql-container': {
                    minHeight: '0 !important',
                  },
                  '& .ql-editor': {
                    p: 0,
                    color: texto,
                    fontSize: 13,
                    lineHeight: 1.55,
                  },
                  '& .ql-editor li::before': { color: tinta },
                  '& .ql-editor a': { color: tinta },
                }}
              >
                <ReactQuillViewer value={descricaoEmHtml(vaga.description)} />
              </Box>

              <Box>
                <Linha rotulo="Quem oferece" paleta={paleta}>
                  {vaga.company}
                </Linha>
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
                    mt: 2,
                    py: 1.1,
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
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
