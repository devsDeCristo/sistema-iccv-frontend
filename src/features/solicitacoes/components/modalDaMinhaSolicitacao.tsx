import { ReactNode } from 'react';
import {
  alpha,
  Box,
  darken,
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
import { corDoStatus, RESPONDIDA, ROTULO_DO_STATUS } from '../constants';
import { iconeDoMinisterio, nomeDoMinisterio } from '../ministerios';
import { MinhaSolicitacao, ProdutoDaSolicitacao } from '../types';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** O acrílico da prancheta: a primária do módulo, a mesma no claro e no escuro */
const COR_DA_PRANCHETA = CORES_DO_MODULO.solicitacoes.claro.primaria;
/** O metal do prendedor */
const METAL = 'linear-gradient(180deg, #E9ECEF, #A9AFB8 55%, #D5D9DE)';
/** A entrelinha do papel pautado da resposta */
const PAUTA = 26;

/** As cores da folha: o papel segue o tema; os títulos, a cor do módulo */
function usePaleta() {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const texto = escuro ? '#EEF0F3' : '#16181D';
  return {
    escuro,
    papel: escuro ? '#1A1D24' : '#FBFAF6',
    texto,
    suave: alpha(texto, 0.6),
    linha: alpha(texto, 0.16),
    tinta: theme.palette.primary.main,
  };
}
type Paleta = ReturnType<typeof usePaleta>;

/** O rótulo de um campo do formulário, em versalete */
function Rotulo({ paleta, children }: { paleta: Paleta; children: string }) {
  return (
    <Typography
      sx={{
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: paleta.suave,
      }}
    >
      {children}
    </Typography>
  );
}

/** Um campo preenchido do formulário: o rótulo e o valor sobre a linha */
function Campo({
  rotulo,
  paleta,
  children,
}: {
  rotulo: string;
  paleta: Paleta;
  children: ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Rotulo paleta={paleta}>{rotulo}</Rotulo>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          minHeight: 28,
          borderBottom: `1px solid ${paleta.linha}`,
          fontSize: 14,
          fontWeight: 600,
          color: paleta.texto,
          overflowWrap: 'anywhere',
          '& svg': { fontSize: 17, color: paleta.tinta, flex: 'none' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/**
 * O carimbo da situação: decidida, batido com força (borda cheia e
 * inclinado); em andamento, um carimbo tracejado, mais leve.
 */
function Carimbo({ s }: { s: MinhaSolicitacao }) {
  const theme = useTheme();
  const cor = corDoStatus(theme, s.status);
  const final = RESPONDIDA[s.status];
  return (
    <Box
      role="status"
      aria-label={`Situação: ${ROTULO_DO_STATUS[s.status]}`}
      sx={{
        flex: 'none',
        px: 1.25,
        py: 0.5,
        border: `${final ? 3 : 2}px ${final ? 'solid' : 'dashed'} ${cor}`,
        borderRadius: 1,
        boxShadow: final ? `inset 0 0 0 2px ${alpha(cor, 0.25)}` : 'none',
        color: cor,
        fontSize: final ? 14 : 12,
        fontWeight: 900,
        letterSpacing: '0.1em',
        lineHeight: 1.2,
        textTransform: 'uppercase',
        transform: `rotate(${final ? -7 : -3}deg)`,
        opacity: final ? 0.9 : 0.8,
        whiteSpace: 'nowrap',
      }}
    >
      {ROTULO_DO_STATUS[s.status]}
    </Box>
  );
}

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
 * A solicitação inteira, para quem pediu, como a folha de um pedido presa
 * numa prancheta — assim como os detalhes da vaga são um crachá. Só leitura:
 * o número e o carimbo da situação no alto, os campos do pedido, o porquê,
 * os produtos numa lista de conferência (o ✓ é o que a igreja aceitou) e a
 * resposta da igreja em papel pautado. Sem o que cada lado marcou: isso é
 * trâmite de dentro.
 *
 * O papel acompanha o tema (claro ou escuro), a prancheta e os títulos usam
 * a cor do módulo. Fecha no X, no Esc ou clicando fora.
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
  const prancheta = paleta.escuro
    ? darken(COR_DA_PRANCHETA, 0.25)
    : COR_DA_PRANCHETA;

  return (
    <Dialog
      open={!!s}
      onClose={onClose}
      scroll="body"
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
        <Box
          sx={{
            position: 'relative',
            pt: '42px',
            px: { xs: 1.25, sm: 1.75 },
            pb: { xs: 1.5, sm: 2 },
            borderRadius: '20px',
            backgroundColor: prancheta,
            // o brilho do acrílico, mais claro no canto de cima
            backgroundImage: `linear-gradient(150deg, ${alpha('#fff', 0.22)}, transparent 40%, ${alpha('#000', 0.18)})`,
            boxShadow: `0 28px 60px rgba(0,0,0,0.45), inset 0 1px 0 ${alpha('#fff', 0.3)}`,
            '@keyframes pousarPrancheta': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-28px) rotate(-3deg)',
              },
              '70%': {
                opacity: 1,
                transform: 'translateY(3px) rotate(0.6deg)',
              },
              '100%': { transform: 'none' },
            },
            animation: 'pousarPrancheta .5s ease-out',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
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
              backgroundColor: darken(paleta.papel, paleta.escuro ? 0 : 0.04),
              borderRadius: '4px',
              transform: 'rotate(-2.8deg)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          />

          {/* ---- a folha do pedido ---- */}
          <Box
            component="article"
            sx={{
              position: 'relative',
              zIndex: 2,
              backgroundColor: paleta.papel,
              color: paleta.texto,
              borderRadius: '4px',
              px: { xs: 2, sm: 2.75 },
              pt: 5,
              pb: 2.5,
               boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
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
                {RESPONDIDA[s.status]
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
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

export { ModalDaMinhaSolicitacao };
