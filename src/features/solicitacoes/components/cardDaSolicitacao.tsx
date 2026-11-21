import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';

import { iconeDoMinisterio, nomeDoMinisterio } from '../ministerios';
import { MinhaSolicitacao } from '../types';
import { Campo, Carimbo } from './folhaDoPedido';
import { usePaleta } from './paletaDaFolha';
import { sombraDeCartao } from '../../../components/listPageStyles';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** Corta o texto em `linhas` linhas, com reticências */
const cortar = (linhas: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: linhas,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  overflowWrap: 'anywhere' as const,
});

/**
 * Uma solicitação, do ponto de vista de quem pediu, como a folha arrancada do
 * talão de requisições: o picote em cima, "Requisição" com o número, o
 * carimbo da situação, o título e os campos do pedido em linhas de
 * formulário. É a mesma folha que, aberta, aparece presa na prancheta
 * (`ModalDaMinhaSolicitacao`): o papel, o campo e o carimbo vêm de lá.
 *
 * O card inteiro abre a solicitação (`onAbrir`), pelo clique ou pelo teclado.
 */
function CardDaSolicitacao({
  solicitacao: s,
  onAbrir,
}: {
  solicitacao: MinhaSolicitacao;
  onAbrir: () => void;
}) {
  const theme = useTheme();
  const paleta = usePaleta();
  // o fundo do ingresso de Eventos (o Paper do tema), e não o papel da prancheta
  const papel = theme.palette.background.paper;
  /**
   * Os furos do picote são recortados (máscara), e não pintados: atrás deles
   * aparece o que estiver atrás do card, seja qual for a superfície
   */
  const furos = 'radial-gradient(circle at 7px 0, transparent 5px, #000 5.6px)';
  const produtos = s.items.length;

  return (
    <Box
      component="article"
      role="button"
      tabIndex={0}
      aria-label={`Abrir a solicitação ${s.title}`}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAbrir();
        }
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // sem fundo próprio: o papel é do picote e do corpo, para não tapar
        // os furos por trás
        color: paleta.texto,
        borderRadius: '0 0 6px 6px',
        overflow: 'hidden',
        cursor: 'pointer',
        // a sombra segue a forma da folha, furos inclusive
        filter: sombraDeCartao(theme),
        transition: 'transform .2s, filter .2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          filter: `${sombraDeCartao(theme)} drop-shadow(0 0 1px ${alpha(paleta.tinta, 0.8)})`,
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      {/* o picote: a folha foi arrancada do bloco */}
      <Box
        aria-hidden
        sx={{
          height: 12,
          flex: 'none',
          backgroundColor: papel,
          borderBottom: `1px dashed ${paleta.linha}`,
          maskImage: furos,
          WebkitMaskImage: furos,
          maskSize: '14px 12px',
          WebkitMaskSize: '14px 12px',
          maskRepeat: 'repeat-x',
          WebkitMaskRepeat: 'repeat-x',
        }}
      />

      <Stack
        gap={1.75}
        sx={{
          flex: 1,
          px: 2.5,
          pt: 2,
          pb: 2.25,
          minWidth: 0,
          backgroundColor: papel,
        }}
      >
        {/* o cabeçalho da folha: o que é, o número e o carimbo */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={1.5}
          sx={{ pb: 1.5, borderBottom: `1px solid ${paleta.linha}` }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: paleta.tinta,
              }}
            >
              Requisição
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: paleta.suave,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              Nº {s.id.slice(0, 8).toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ mt: 0.5 }}>
            <Carimbo s={s} />
          </Box>
        </Stack>

        <Typography
          component="h3"
          sx={{ fontSize: 19, fontWeight: 800, lineHeight: 1.2, ...cortar(2) }}
        >
          {s.title}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: 2,
          }}
        >
          <Campo rotulo="Ministério" paleta={paleta}>
            {iconeDoMinisterio(s.ministry)}
            <Box component="span" sx={{ minWidth: 0, ...cortar(1) }}>
              {nomeDoMinisterio(s)}
            </Box>
          </Campo>
          <Campo rotulo="Pedido em" paleta={paleta}>
            {data(s.createdAt)}
          </Campo>
        </Box>

        <Typography sx={{ mt: 'auto', fontSize: 12.5, color: paleta.suave }}>
          {produtos} {produtos === 1 ? 'produto' : 'produtos'} ·{' '}
          {s.response ? 'respondida pela igreja' : s.church.name}
        </Typography>
      </Stack>
    </Box>
  );
}

export { CardDaSolicitacao };
