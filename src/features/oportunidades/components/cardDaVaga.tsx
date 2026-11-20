import { ReactNode } from 'react';
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
import {
  CalendarTodayOutlined,
  CheckCircle,
  ChevronRight,
  PaymentsOutlined,
  PlaceOutlined,
  Work,
} from '@mui/icons-material';
import CustomChip from '../../../components/customChip';
import { superficieSx } from '../../../components/listPageStyles';
import { corDoModulo } from '../../../constants/identidadeDosModulos';
import {
  descricaoEmTexto,
  formatarData,
  formatarSalario,
  prazo,
} from '../formulario';
import { Oportunidade } from '../types';

/** Uma informação curta com ícone */
export function Info({
  icone,
  children,
}: {
  icone: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.75}
      sx={{ minWidth: 0, '& svg': { fontSize: 16, color: 'text.secondary' } }}
    >
      {icone}
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, minWidth: 0 }}>
        {children}
      </Typography>
    </Stack>
  );
}

/** A logo num quadrado: `contain` sobre branco, nunca cortada nem esticada */
export function LogoDaVaga({
  vaga,
  tamanho,
}: {
  vaga: Pick<Oportunidade, 'imagemUrl' | 'company'>;
  tamanho: number;
}) {
  const theme = useTheme();
  const cor = corDoModulo(theme, 'oportunidades');
  return (
    <Box
      sx={{
        width: tamanho,
        height: tamanho,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: vaga.imagemUrl ? '#fff' : alpha(cor, 0.16),
        boxShadow: vaga.imagemUrl ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {vaga.imagemUrl ? (
        <Box
          component="img"
          src={vaga.imagemUrl}
          alt={`Logo de ${vaga.company}`}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <Work sx={{ fontSize: tamanho * 0.5, color: alpha(cor, 0.7) }} />
      )}
    </Box>
  );
}

/** A faixa tingida do módulo com a logo quadrada no meio */
export function ImagemDaVaga({
  vaga,
  altura,
}: {
  vaga: Pick<Oportunidade, 'imagemUrl' | 'company'>;
  altura: number;
}) {
  const theme = useTheme();
  const cor = corDoModulo(theme, 'oportunidades');
  return (
    <Box
      sx={{
        height: altura,
        display: 'grid',
        placeItems: 'center',
        backgroundColor: alpha(cor, theme.palette.mode === 'dark' ? 0.16 : 0.1),
      }}
    >
      <LogoDaVaga vaga={vaga} tamanho={Math.round(altura * 0.72)} />
    </Box>
  );
}

/** Corta o texto em `linhas` linhas, com reticências */
const cortar = (linhas: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: linhas,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  overflowWrap: 'anywhere' as const,
});

/**
 * Uma vaga na vitrine do membro, no mesmo estilo dos cards de Solicitações:
 * a situação numa etiqueta pendurada na borda de cima, à direita, e o fundo
 * com degradê e pontinhos saindo do canto superior esquerdo, na cor do
 * módulo (a da logo fica para o crachá). Ao passar o mouse, o fundo
 * acende e a borda aparece. O card inteiro abre o crachá dos detalhes.
 *
 * Encerrada, o card apaga em cinza, como a solicitação recusada.
 */
export function CardDaVaga({
  vaga,
  interessei,
  onAbrir,
}: {
  vaga: Oportunidade;
  interessei: boolean;
  onAbrir: () => void;
}) {
  const theme = useTheme();
  const cinza = theme.palette.text.secondary;
  const cor = vaga.encerrada ? cinza : corDoModulo(theme, 'oportunidades');
  const salario = formatarSalario(vaga.salario);
  const ate = vaga.encerrada ? null : prazo(vaga.closesAt);
  const perto = !!ate && /hoje|amanhã|Faltam/.test(ate);
  const resumo = descricaoEmTexto(vaga.description);

  // a etiqueta: a situação de quem olha, ou o prazo quando está acabando
  // encerrada em vermelho, aberta em verde (com o prazo, quando acabando);
  // a candidatura enviada fica na cor do módulo, para não se confundir
  const [etiqueta, corDaEtiqueta] = vaga.encerrada
    ? ['Encerrada', theme.palette.error.main]
    : interessei
      ? ['Candidatura enviada', cor]
      : [perto ? ate : 'Aberta', theme.palette.success.main];

  return (
    <Paper
      component="article"
      role="button"
      tabIndex={0}
      aria-label={`Ver a vaga ${vaga.title}, ${vaga.company}`}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAbrir();
        }
      }}
      sx={{
        ...superficieSx,
        position: 'relative',
        // o fundo decorado fica em z-index -1 dentro do card
        isolation: 'isolate',
        overflow: 'hidden',
        height: '100%',
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        p: 2.5,
        pt: 5,
        cursor: 'pointer',
        outline: 'none',
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
          background: `linear-gradient(135deg, ${alpha(cor, 0.16)} 0%, ${alpha(
            cor,
            0.05
          )} 50%, transparent 85%)`,
        },
        '&::after': {
          backgroundImage: `radial-gradient(${alpha(
            cor,
            0.3
          )} 1px, transparent 1.5px)`,
          backgroundSize: '10px 10px',
          maskImage: 'linear-gradient(135deg, #000 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(135deg, #000 0%, transparent 70%)',
        },
        ...(vaga.encerrada && {
          '& .MuiTypography-root:not(.etiqueta)': { color: 'text.secondary' },
        }),
        '&:hover, &:focus-visible': {
          boxShadow: `0 0 0 1px ${alpha(cor, 0.5)}, 0 6px 18px ${alpha(
            cor,
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
          bgcolor: darken(corDaEtiqueta, 0.35),
          boxShadow: `0 2px 8px ${alpha(darken(corDaEtiqueta, 0.5), 0.3)}`,
        }}
      >
        {interessei && !vaga.encerrada ? (
          <CheckCircle sx={{ fontSize: 13, color: '#fff' }} />
        ) : (
          <Box
            aria-hidden
            sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#fff' }}
          />
        )}
        <Typography
          className="etiqueta"
          sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4, color: '#fff' }}
        >
          {etiqueta}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1.5}>
        <LogoDaVaga vaga={vaga} tamanho={48} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, ...cortar(2) }}>
            {vaga.title}
          </Typography>
          <Typography noWrap sx={{ fontSize: 13, color: 'text.secondary' }}>
            {vaga.company}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        columnGap={1.5}
        rowGap={0.75}
      >
        {salario && (
          <CustomChip
            size="small"
            icon={<PaymentsOutlined />}
            label={salario}
            customColor={vaga.encerrada ? cinza : cor}
            sx={{ '& .MuiChip-icon': { color: 'inherit', fontSize: 15 } }}
          />
        )}
        {vaga.location && (
          <Info icone={<PlaceOutlined />}>{vaga.location}</Info>
        )}
        <Info icone={<CalendarTodayOutlined />}>
          {formatarData(vaga.createdAt)}
        </Info>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={cortar(3)}>
        {resumo}
      </Typography>

      {/* o prazo preso ao rodapé, como a resposta nas solicitações */}
      <Divider sx={{ mt: 'auto' }} />
      <Stack
        direction="row"
        alignItems="flex-end"
        justifyContent="space-between"
        gap={1}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.25 }}>
            Candidaturas
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: perto ? 'warning.main' : undefined }}
          >
            {vaga.encerrada
              ? 'Encerradas'
              : vaga.closesAt
                ? `Até ${formatarData(vaga.closesAt)}${perto ? ` · ${ate}` : ''}`
                : 'Sem data para encerrar'}
          </Typography>
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          gap={0.25}
          aria-hidden
          sx={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 700,
            color: vaga.encerrada ? 'text.secondary' : cor,
            '& svg': { fontSize: 16 },
          }}
        >
          Ver vaga <ChevronRight />
        </Stack>
      </Stack>
    </Paper>
  );
}
