import { useEffect, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  darken,
  lighten,
  Dialog,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CheckRounded,
  Close,
  CloseRounded,
  OpenInNew,
} from '@mui/icons-material';

import { CORES_DO_MODULO } from '../../../constants/identidadeDosModulos';
import { useCancelarSolicitacao } from '../api';
import { PODE_CANCELAR, RESPONDIDA } from '../constants';
import { iconeDoMinisterio, nomeDoMinisterio } from '../ministerios';
import { MinhaSolicitacao, ProdutoDaSolicitacao } from '../types';
import { Campo, Carimbo, Rotulo } from './folhaDoPedido';
import { Paleta, usePaleta } from './paletaDaFolha';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** A cor do módulo, na pasta de trás: a prancheta é de madeira */
const COR_DO_MODULO = CORES_DO_MODULO.solicitacoes.claro.primaria;
/**
 * Um ruído em SVG (feTurbulence), para a textura da chapa: `frequencia` alta
 * dá o pontilhado fino; baixa, as manchas largas de tom. A cor é fixa
 * (`[r, g, b]`, de 0 a 1) e a transparência vem do ruído: alfa × ruído +
 * desvio — o desvio negativo apaga o ruído fraco e deixa só os pontos.
 */
const ruido = (
  frequencia: number,
  [r, g, b]: number[],
  alfa: number,
  desvio: number
) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='r' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='${frequencia}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${alfa} 0 0 0 ${desvio}'/></filter><rect width='100%' height='100%' filter='url(#r)'/></svg>`
  )}")`;

/** O pontilhado escuro, o claro e as manchas, montados uma vez só */
const PONTOS_ESCUROS = ruido(0.85, [0.24, 0.13, 0.05], 0.85, -0.2);
const PONTOS_CLAROS = ruido(1.1, [1, 0.9, 0.75], 0.5, -0.2);
const MANCHAS = ruido(0.012, [0.3, 0.17, 0.07], 0.35, -0.08);

/**
 * A prancheta de chapa de fibra (tipo Eucatex): o marrom claro e liso, sem
 * veio, com o pontilhado fino, manchas largas de tom e o brilho no canto.
 */
const madeira = (escuro: boolean) => ({
  backgroundColor: escuro ? '#9E7149' : '#BE8C5C',
  backgroundImage: [
    `linear-gradient(150deg, ${alpha('#fff', 0.1)}, transparent 40%, ${alpha('#000', 0.14)})`,
    PONTOS_ESCUROS,
    PONTOS_CLAROS,
    MANCHAS,
  ].join(', '),
});
/** O metal do prendedor */
const METAL = 'linear-gradient(180deg, #E9ECEF, #A9AFB8 55%, #D5D9DE)';
/** Sem animação para quem pediu menos movimento */
const SEM_MOVIMENTO = {
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

/** A altura da faixa do picote no pé da folha, a mesma do card */
const PICOTE = 12;
/** Os meios-furos recortados na borda de baixo (no card, na de cima) */
const FUROS = `radial-gradient(circle at 7px 100%, transparent 5px, #000 5.6px)`;

/** O papel de uma folha, cobrindo tudo menos a faixa do picote, no pé */
const papelComPicote = (papel: string) => ({
  backgroundImage: `linear-gradient(${papel}, ${papel})`,
  backgroundSize: `100% calc(100% - ${PICOTE}px)`,
  backgroundRepeat: 'no-repeat',
});

/**
 * O picote no pé de uma folha: os meios-furos de onde os cards da lista
 * saíram. A faixa tem o papel próprio, recortado nos furos; a folha, sem
 * fundo ali, deixa ver o que está atrás.
 */
function Picote({ papel, linha }: { papel: string; linha: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        left: -1,
        right: -1,
        bottom: 0,
        height: PICOTE,
        backgroundColor: papel,
        borderTop: `1px dashed ${linha}`,
        borderLeft: `1px solid ${linha}`,
        borderRight: `1px solid ${linha}`,
        maskImage: FUROS,
        WebkitMaskImage: FUROS,
        maskSize: `14px ${PICOTE}px`,
        WebkitMaskSize: `14px ${PICOTE}px`,
        maskRepeat: 'repeat-x',
        WebkitMaskRepeat: 'repeat-x',
      }}
    />
  );
}

/** A entrelinha do papel pautado da resposta */
const PAUTA = 26;

/** Um produto na lista de conferência: ☑ aceito, ☒ não aceito, ☐ sem resultado */
function ItemDaLista({
  produto: p,
  paleta,
}: {
  produto: ProdutoDaSolicitacao;
  paleta: Paleta;
}) {
  const theme = useTheme();
  const recusado = p.accepted === false;
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.25}
      sx={{ py: 0.75, borderBottom: `1px dashed ${paleta.linha}` }}
    >
      <Box
        aria-label={
          p.accepted === true
            ? 'Aceito'
            : recusado
              ? 'Não aceito'
              : 'Sem resultado ainda'
        }
        sx={{
          width: 18,
          height: 18,
          flex: 'none',
          display: 'grid',
          placeItems: 'center',
          border: `2px solid ${alpha(paleta.texto, 0.55)}`,
          borderRadius: '3px',
          '& svg': { fontSize: 16 },
        }}
      >
        {p.accepted === true && (
          <CheckRounded sx={{ color: theme.palette.chips.success }} />
        )}
        {recusado && <CloseRounded sx={{ color: paleta.suave }} />}
      </Box>
      <Typography
        sx={{
          flex: 'none',
          fontSize: 13.5,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
          color: recusado ? paleta.suave : paleta.texto,
        }}
      >
        {p.quantity}×
      </Typography>
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 14,
          overflowWrap: 'anywhere',
          color: recusado ? paleta.suave : paleta.texto,
          textDecoration: recusado ? 'line-through' : 'none',
        }}
      >
        {p.name}
      </Typography>
      {p.link && (
        <IconButton
          size="small"
          component="a"
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver ${p.name} na loja`}
          sx={{ p: 0.25, color: paleta.tinta, flex: 'none' }}
        >
          <OpenInNew sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Stack>
  );
}

/** O prendedor de metal no alto da prancheta, com a alavanca e os rebites */
function Prendedor() {
  const rebite = {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #fff, #8E949E 70%)',
    boxShadow: '0 1px 1px rgba(0,0,0,0.4)',
  };
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        // a placa morde a borda de cima da folha (que começa em 52px)
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        width: 150,
      }}
    >
      {/* a alavanca, em arco por cima da placa */}
      <Box
        sx={{
          width: 72,
          height: 26,
          mx: 'auto',
          mb: '-8px',
          border: '5px solid #B8BDC6',
          borderBottom: 'none',
          borderRadius: '16px 16px 0 0',
        }}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          height: 34,
          px: 2,
          background: METAL,
          borderRadius: '8px 8px 16px 16px',
          boxShadow:
            '0 4px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        <Box sx={rebite} />
        <Box sx={rebite} />
      </Stack>
    </Box>
  );
}

/**
 * A pasta atrás da prancheta, inclinada e só com o nome — como o segundo
 * crachá atrás do da vaga. No celular não cabe ao lado e some.
 */
function PastaDeTras({ cor }: { cor: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        display: { xs: 'none', sm: 'flex' },
        position: 'absolute',
        top: 34,
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: '20px',
        backgroundColor: cor,
        backgroundImage: `linear-gradient(160deg, ${alpha('#fff', 0.12)}, transparent 50%, ${alpha('#000', 0.16)})`,
        transformOrigin: 'top center',
        transform: 'translateX(24%) rotate(7deg)',
        boxShadow: '0 24px 50px rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'flex-end',
        pr: 2,
        // o nome grande não passa da pasta
        overflow: 'hidden',
      }}
    >
      <Typography
        sx={{
          writingMode: 'vertical-rl',
          fontSize: 84,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '0.04em',
          // a cor da pasta, escurecida: marca d'água
          color: darken(cor, 0.28),
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Solicitação
      </Typography>
    </Box>
  );
}

/**
 * A solicitação inteira, para quem pediu, como a folha de um pedido presa
 * numa prancheta — assim como os detalhes da vaga são um crachá. Só leitura:
 * o número e o carimbo da situação no alto, os campos do pedido, o porquê,
 * os produtos numa lista de conferência (o ✓ é o que a igreja aceitou) e a
 * resposta da igreja em papel pautado. Sem o que cada lado marcou: isso é
 * trâmite de dentro.
 *
 * Antes de o pastor ou a tesouraria decidir, quem pediu pode desistir
 * (Cancelar solicitação, com confirmação no pé da folha). A janela segue
 * aberta, e o carimbo vira "Cancelado".
 *
 * O papel e a madeira acompanham o tema (claro ou escuro); a pasta de trás e
 * os títulos usam a cor do módulo. Fecha no X, no Esc ou clicando fora.
 */
function ModalDaMinhaSolicitacao({
  solicitacao: s,
  onClose,
}: {
  /** a solicitação aberta; `null` fecha a janela */
  solicitacao: MinhaSolicitacao | null;
  onClose: () => void;
}) {
  const paleta = usePaleta();
  const corDaPasta = darken(COR_DO_MODULO, paleta.escuro ? 0.45 : 0.3);
  const papelDeBaixo = paleta.escuro
    ? lighten(paleta.papel, 0.07)
    : darken(paleta.papel, 0.06);
  const cancelar = useCancelarSolicitacao();
  const [confirmando, setConfirmando] = useState(false);
  // outra solicitação aberta começa sem a confirmação
  useEffect(() => setConfirmando(false), [s?.id]);
  const podeCancelar = !!s && PODE_CANCELAR.includes(s.status);

  return (
    <Dialog
      open={!!s}
      onClose={cancelar.isLoading ? undefined : onClose}
      scroll="body"
      // a pasta de trás passa da caixa do Dialog: sem rolagem de lado
      sx={{ '& .MuiDialog-container': { overflowX: 'hidden' } }}
      maxWidth={false}
      aria-label={s ? `Solicitação: ${s.title}` : undefined}
      PaperProps={{
        sx: {
          // o Dialog é só o lugar: quem aparece é a prancheta
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          width: 'calc(100% - 32px)',
          maxWidth: 460,
          m: { xs: 2, sm: 4 },
        },
      }}
    >
      {s && (
        // o par fica centrado: a prancheta vai um pouco para a esquerda
        <Box sx={{ position: 'relative', left: { sm: '-9%' } }}>
          <PastaDeTras cor={corDaPasta} />
          <Box
            sx={{
              position: 'relative',
              pt: '42px',
              px: { xs: 1.25, sm: 1.75 },
              pb: { xs: 1.5, sm: 2 },
              borderRadius: '20px',
              ...madeira(paleta.escuro),
              boxShadow: `0 28px 60px rgba(0,0,0,0.45), inset 0 1px 0 ${alpha('#fff', 0.3)}`,
              /**
               * A entrada: a prancheta sobe e esmaece já com as folhas nela
               * (sem atraso nem opacidade própria, senão aparecia vazia), e as
               * folhas, presas no alto pelo prendedor, baixam a ponta de baixo
               * até deitar — o alto não se mexe. Um
               * movimento só por peça, e quem dá o "passar e voltar"
               * é a curva com mola (sem paradas no meio, que davam trancos);
               * a opacidade acaba cedo e o deslize segue.
               */
              '@keyframes pousarPrancheta': {
                '0%': { opacity: 0, transform: 'translateY(14px)' },
                '60%': { opacity: 1 },
                '100%': { opacity: 1, transform: 'none' },
              },
              animation: 'pousarPrancheta .45s cubic-bezier(.22,1,.36,1) both',
              ...SEM_MOVIMENTO,
            }}
          >
            <Prendedor />

            {/* a folha de baixo, um pouco torta, dá o volume do bloco */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                top: 50,
                bottom: 22,
                left: 20,
                right: 16,
                // um tom fora da folha de cima e borda fina: no escuro as duas
                // tinham a mesma cor e o alto se misturava. No pé, o picote
                ...papelComPicote(papelDeBaixo),
                border: `1px solid ${paleta.linha}`,
                borderBottom: 'none',
                borderRadius: '4px 4px 0 0',
                transform: 'rotate(-2.8deg)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                // presa no alto: a ponta de baixo, levantada, baixa e assenta torta
                transformOrigin: 'top center',
                '@keyframes assentarFolhaDeBaixo': {
                  '0%': {
                    transform:
                      'perspective(1000px) rotateX(12deg) rotate(0deg)',
                  },
                  '100%': {
                    transform:
                      'perspective(1000px) rotateX(0deg) rotate(-2.8deg)',
                  },
                },
                animation:
                  'assentarFolhaDeBaixo .75s cubic-bezier(.34,1.3,.64,1) both',
                willChange: 'transform',
                ...SEM_MOVIMENTO,
              }}
            >
              <Picote papel={papelDeBaixo} linha={paleta.linha} />
            </Box>

            {/* ---- a folha do pedido ---- */}
            <Box
              component="article"
              sx={{
                position: 'relative',
                zIndex: 2,
                // o papel deixa livre a faixa do picote, no pé
                ...papelComPicote(paleta.papel),
                color: paleta.texto,
                border: `1px solid ${paleta.linha}`,
                borderBottom: 'none',
                borderRadius: '4px 4px 0 0',
                px: { xs: 2, sm: 2.75 },
                pt: 5,
                pb: `calc(20px + ${PICOTE}px)`,
                // a sombra segue o recorte, furos inclusive
                filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))',
                // presa no alto: a ponta de baixo, levantada e um pouco de lado,
                // baixa até deitar e balança em volta do prendedor
                transformOrigin: 'top center',
                '@keyframes cairFolha': {
                  '0%': {
                    transform:
                      'perspective(1000px) rotateX(16deg) rotate(1.5deg)',
                  },
                  '100%': {
                    transform: 'perspective(1000px) rotateX(0deg) rotate(0deg)',
                  },
                },
                animation: 'cairFolha .9s cubic-bezier(.34,1.35,.64,1) both',
                willChange: 'transform',
                ...SEM_MOVIMENTO,
              }}
            >
              <IconButton
                onClick={onClose}
                aria-label="Fechar"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: paleta.suave,
                  '&:hover': {
                    color: paleta.texto,
                    backgroundColor: paleta.linha,
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>

              {/* o cabeçalho do formulário: o que é, o número e o carimbo */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1.5}
                sx={{
                  pb: 1.5,
                  mb: 2,
                  borderBottom: `2px solid ${paleta.texto}`,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: paleta.tinta,
                    }}
                  >
                    Solicitação
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: paleta.suave,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    Nº {s.id.slice(0, 8).toUpperCase()}
                  </Typography>
                </Box>
                <Carimbo s={s} />
              </Stack>

              <Typography
                component="h2"
                sx={{
                  fontSize: { xs: 19, sm: 21 },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  overflowWrap: 'anywhere',
                  mb: 2,
                }}
              >
                {s.title}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  columnGap: 2,
                  rowGap: 1.5,
                  mb: 2.25,
                }}
              >
                <Campo rotulo="Ministério" paleta={paleta}>
                  {iconeDoMinisterio(s.ministry)}
                  {nomeDoMinisterio(s)}
                </Campo>
                <Campo rotulo="Pedido em" paleta={paleta}>
                  {data(s.createdAt)}
                </Campo>
                <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                  <Campo rotulo="Para a igreja" paleta={paleta}>
                    {s.church.name}
                  </Campo>
                </Box>
              </Box>

              <Rotulo paleta={paleta}>Por que precisa</Rotulo>
              <Typography
                sx={{
                  mt: 0.5,
                  mb: 2.25,
                  fontSize: 14,
                  lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                  overflowWrap: 'anywhere',
                }}
              >
                {s.description}
              </Typography>

              <Stack direction="row" alignItems="baseline" gap={1}>
                <Rotulo paleta={paleta}>Produtos</Rotulo>
                <Typography sx={{ fontSize: 11.5, color: paleta.suave }}>
                  {s.status === 'CANCELED'
                    ? '· cancelada antes da decisão'
                    : RESPONDIDA[s.status]
                      ? '· o ✓ é o que a igreja aceitou'
                      : '· o resultado sai quando a igreja decidir'}
                </Typography>
              </Stack>
              <Box sx={{ mt: 0.5, mb: 2.5 }}>
                {s.items.map((p) => (
                  <ItemDaLista key={p.id} produto={p} paleta={paleta} />
                ))}
              </Box>

              <Rotulo paleta={paleta}>Resposta da igreja</Rotulo>
              <Typography
                sx={{
                  mt: 0.5,
                  minHeight: PAUTA * 3,
                  fontSize: 14,
                  lineHeight: `${PAUTA}px`,
                  whiteSpace: 'pre-line',
                  overflowWrap: 'anywhere',
                  // o papel pautado: uma linha a cada entrelinha
                  backgroundImage: `repeating-linear-gradient(transparent 0 ${PAUTA - 1}px, ${paleta.linha} ${PAUTA - 1}px ${PAUTA}px)`,
                  ...(!s.response && {
                    color: paleta.suave,
                    fontStyle: 'italic',
                  }),
                }}
              >
                {s.response ?? 'Ainda sem resposta'}
              </Typography>

              {/* desistir: só antes de o pastor ou a tesouraria decidir, e com
                confirmação ali mesmo — o SweetAlert abriria por baixo */}
              {podeCancelar && (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-end"
                  flexWrap="wrap"
                  gap={1}
                  sx={{
                    mt: 2.5,
                    pt: 1.5,
                    borderTop: `1px dashed ${paleta.linha}`,
                  }}
                >
                  {confirmando ? (
                    <>
                      <Typography
                        sx={{ flex: 1, minWidth: 180, fontSize: 13.5 }}
                      >
                        Desistir deste pedido? A igreja deixa de analisá-lo.
                      </Typography>
                      <Button
                        size="small"
                        disabled={cancelar.isLoading}
                        onClick={() => setConfirmando(false)}
                        sx={{ color: paleta.texto, textTransform: 'none' }}
                      >
                        Voltar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        disabled={cancelar.isLoading}
                        onClick={() =>
                          cancelar.mutate(s.id, {
                            onSettled: () => setConfirmando(false),
                          })
                        }
                        sx={{ textTransform: 'none' }}
                      >
                        {cancelar.isLoading ? 'Cancelando…' : 'Sim, cancelar'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setConfirmando(true)}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancelar solicitação
                    </Button>
                  )}
                </Stack>
              )}

              <Picote papel={paleta.papel} linha={paleta.linha} />
            </Box>

            {/* o nome gravado a fogo na madeira, na borda de baixo */}
            <Typography
              aria-hidden
              sx={{
                mt: { xs: 1.25, sm: 1.5 },
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.4em',
                pl: '0.4em',
                textTransform: 'uppercase',
                color: alpha('#000', 0.28),
                textShadow: `0 1px 0 ${alpha('#fff', 0.22)}`,
              }}
            >
              Solicitações
            </Typography>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

export { ModalDaMinhaSolicitacao };
