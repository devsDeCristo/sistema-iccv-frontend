import {
  alpha,
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBackRounded,
  CalendarMonthOutlined,
  RoomOutlined,
} from '@mui/icons-material';
import { ReactNode } from 'react';
import { EventDetails } from '../../admin/events/types';
import CapaLogin from '../../../assets/capaLogin2.jpg';
import { formatarPeriodo } from '../utils';

function Meta({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          color: alpha('#fff', 0.75),
          '& svg': { fontSize: 15 },
        }}
      >
        {icone}
      </Box>
      <Typography
        noWrap
        sx={{
          fontSize: '0.8125rem',
          color: alpha('#fff', 0.9),
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
          minWidth: 0,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

/**
 * O evento, no alto da tela de inscrição.
 *
 * É o mesmo cartaz da home, em versão baixa: a capa de fundo, o filtro que a
 * assenta, a logo à esquerda e o nome com quando e onde. Quem chega aqui veio
 * de um cartaz igual a este — manter a imagem é o que diz, sem escrever, que a
 * inscrição é daquele evento e não de outro.
 *
 * No lugar do cabeçalho de texto que havia antes ("Inscrever-se", com uma seta
 * de voltar genérica): a seta continua, agora sobre a capa, em vidro.
 */
function SubscribeHero({
  event,
  etapa,
  onVoltar,
}: {
  event: EventDetails;
  /** o que está acontecendo agora: "Escolha dos grupos", "Produtos do evento"… */
  etapa: string;
  onVoltar: () => void;
}) {
  const theme = useTheme();

  const styles = {
    cartaz: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
      borderRadius: 3,
      minHeight: 132,
      mb: 2.5,
    },
    capa: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `url(${event?.data?.coverUrl || CapaLogin})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    /** o mesmo 38% da página do evento: é ele que assenta foto clara */
    filtro: {
      position: 'absolute',
      inset: 0,
      backgroundColor: alpha('#000', 0.38),
    },
    /** escurece indo para a direita, onde mora o texto */
    veu: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(90deg, transparent 10%, ${alpha(
        theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : theme.palette.text.primary,
        0.48
      )} 58%, ${alpha(
        theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : theme.palette.text.primary,
        0.76
      )} 100%)`,
    },
    conteudo: {
      position: 'relative',
      zIndex: 1,
      display: 'grid',
      gridTemplateColumns: event?.data?.logoUrl
        ? 'auto minmax(0, 1fr)'
        : 'minmax(0, 1fr)',
      alignItems: 'center',
      columnGap: 1.5,
      width: '100%',
      p: 1.5,
      pl: { xs: 1.5, sm: 7 },
    },
    logo: {
      maxHeight: 56,
      maxWidth: 88,
      objectFit: 'contain',
      filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.55))',
    },
    voltar: {
      position: 'absolute',
      top: 12,
      left: 12,
      zIndex: 2,
      color: '#fff',
      backgroundColor: alpha('#000', 0.28),
      backdropFilter: 'blur(6px)',
      '&:hover': { backgroundColor: alpha('#000', 0.5) },
    },
    etapa: {
      fontSize: 10.5,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: alpha('#fff', 0.85),
    },
    nome: {
      color: '#fff',
      fontWeight: 800,
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
      fontSize: { xs: '1.05rem', sm: '1.25rem' },
      textShadow: '0 2px 14px rgba(0,0,0,0.5)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
  };

  return (
    <Box sx={styles.cartaz}>
      <Box
        sx={styles.capa}
        role="img"
        aria-label={`Capa de ${event?.name ?? 'evento'}`}
      />
      <Box sx={styles.filtro} />
      <Box sx={styles.veu} />

      <IconButton size="small" sx={styles.voltar} onClick={onVoltar}>
        <ArrowBackRounded fontSize="small" />
      </IconButton>

      <Box sx={styles.conteudo}>
        {event?.data?.logoUrl && (
          <Box
            component="img"
            src={event.data.logoUrl}
            alt={`Logo de ${event.name}`}
            sx={styles.logo}
          />
        )}

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={styles.etapa}>{etapa}</Typography>
          <Typography sx={styles.nome}>{event?.name}</Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={{ xs: 0.25, md: 1.75 }}
            sx={{ mt: 0.5, minWidth: 0 }}
          >
            <Meta icone={<CalendarMonthOutlined />}>
              {formatarPeriodo(event?.startDate, event?.endDate, {
                comAno: true,
              })}
            </Meta>
            {event?.data?.localName && (
              <Meta icone={<RoomOutlined />}>{event.data.localName}</Meta>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export { SubscribeHero };
