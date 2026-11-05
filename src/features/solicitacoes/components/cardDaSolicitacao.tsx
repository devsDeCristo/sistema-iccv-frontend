import {
  alpha,
  Box,
  darken,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CalendarTodayOutlined } from '@mui/icons-material';

import CustomChip from '../../../components/customChip';
import { superficieSx } from '../../../components/listPageStyles';
import { corDoStatus, ROTULO_DO_STATUS } from '../constants';
import { iconeDoMinisterio } from '../ministerios';
import { MinhaSolicitacao } from '../types';
import { ListaDeProdutos } from './listaDeProdutos';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** Corta o texto em `linhas` linhas, com reticências */
const cortar = (linhas: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: linhas,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  overflowWrap: 'anywhere' as const,
});

/** O ícone e o valor, como as contagens dos cards de mapa */
function Info({
  icone,
  children,
}: {
  icone: React.ReactNode;
  children: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{ minWidth: 0, '& svg': { fontSize: 15, color: 'text.secondary' } }}
    >
      {icone}
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>
        {children}
      </Typography>
    </Stack>
  );
}

/**
 * Uma solicitação, do ponto de vista de quem pediu, no estilo dos cards de
 * mapa do easymaps: a situação numa etiqueta pendurada na borda de cima, à
 * direita, e o fundo com degradê e pontinhos na cor dela, saindo do canto
 * superior esquerdo. Ao passar o mouse, o fundo acende e a borda aparece.
 *
 * A etiqueta é a cor da situação, chapada e escurecida: na cor cheia, o texto
 * branco não dá contraste no laranja de "Em análise".
 *
 * Recusada, o card apaga: fundo, pontinhos, chip, textos e links em cinza, e
 * só a etiqueta "Recusado" fica em vermelho.
 */
function CardDaSolicitacao({
  solicitacao: s,
}: {
  solicitacao: MinhaSolicitacao;
}) {
  const theme = useTheme();
  const cor = corDoStatus(theme, s.status);
  // recusada, o card inteiro apaga em cinza; só a etiqueta fica na cor
  const recusada = s.status === 'REJECTED';
  // o secundário, e não o desabilitado: no escuro o desabilitado não se lê
  const cinza = theme.palette.text.secondary;
  const corDoFundo = recusada ? cinza : cor;

  return (
    <Paper
      sx={{
        ...superficieSx,
        position: 'relative',
        // o fundo decorado fica em z-index -1 dentro do card: acima do fundo
        // dele e abaixo de todo o conteúdo
        isolation: 'isolate',
        overflow: 'hidden',
        height: '100%',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        p: 2.5,
        pt: 5,
        transition: 'box-shadow .2s',
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          transition: 'opacity .25s',
          opacity: 0.75,
        },
        '&::before': {
          background: `linear-gradient(135deg, ${alpha(corDoFundo, 0.16)} 0%, ${alpha(
            corDoFundo,
            0.05
          )} 50%, transparent 85%)`,
        },
        // a textura de pontos some na mesma direção do degradê
        '&::after': {
          backgroundImage: `radial-gradient(${alpha(
            corDoFundo,
            0.3
          )} 1px, transparent 1.5px)`,
          backgroundSize: '10px 10px',
          maskImage: 'linear-gradient(135deg, #000 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(135deg, #000 0%, transparent 70%)',
        },
        // recusada: textos e link apagados, como o resto do card
        ...(recusada && {
          '& .MuiTypography-root:not(.etiqueta)': { color: 'text.secondary' },
          '& .MuiLink-root, & .MuiLink-root svg': { color: 'text.secondary' },
        }),
        '&:hover': {
          boxShadow: `0 0 0 1px ${alpha(corDoFundo, 0.5)}, 0 6px 18px ${alpha(
            corDoFundo,
            0.16
          )}`,
          '&::before, &::after': { opacity: 1 },
        },
      }}
    >
      {/* a situação, pendurada na borda de cima, à direita */}
      <Stack
        direction="row"
        alignItems="center"
        gap={0.75}
        sx={{
          position: 'absolute',
          right: 20,
          top: 0,
          px: 1.25,
          py: 0.5,
          borderRadius: '0 0 6px 6px',
          bgcolor: darken(cor, 0.35),
          boxShadow: `0 2px 8px ${alpha(darken(cor, 0.5), 0.3)}`,
        }}
      >
        <Box
          aria-hidden
          sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#fff' }}
        />
        <Typography
          className="etiqueta"
          sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: '#fff' }}
        >
          {ROTULO_DO_STATUS[s.status]}
        </Typography>
      </Stack>

      <Typography sx={{ fontSize: 18, fontWeight: 700, ...cortar(2) }}>
        {s.title}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        columnGap={1.5}
        rowGap={0.75}
      >
        {/* o ministério num chip, na cor do módulo; o ícone acompanha */}
        <CustomChip
          size="small"
          icon={iconeDoMinisterio(s.ministry)}
          label={s.ministry}
          customColor={recusada ? cinza : theme.palette.secondary.main}
          sx={{ '& .MuiChip-icon': { color: 'inherit', fontSize: 15 } }}
        />
        <Info icone={<CalendarTodayOutlined />}>{data(s.createdAt)}</Info>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={cortar(3)}>
        {s.description}
      </Typography>
      <ListaDeProdutos produtos={s.items} limite={3} />

      {/* a resposta presa ao rodapé, como os alertas dos mapas */}
      <Divider sx={{ mt: 'auto' }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.25 }}>
          Resposta da igreja
        </Typography>
        {s.response ? (
          <Typography variant="body2" sx={cortar(3)}>
            {s.response}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            Ainda sem resposta
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export { CardDaSolicitacao };
