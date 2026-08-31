import {
  alpha,
  Box,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { CampaignOutlined } from '@mui/icons-material';
import { useGetNews } from '../api/getNews';
import { News } from '../types';
import { dataDaNoticia } from '../utils';
import { NewsModal } from './newsModal';

/** Quantas notícias o feed da tela de eventos carrega. */
const LIMITE_DO_FEED = 6;

function ItemDoFeed({ news, onClick }: { news: News; onClick: () => void }) {
  const theme = useTheme();

  return (
    <Stack
      onClick={onClick}
      direction="row"
      gap={1.5}
      sx={{
        p: 1,
        mx: -1,
        borderRadius: 2,
        cursor: 'pointer',
        transition: theme.transitions.create('background-color', {
          duration: 160,
        }),
        '&:hover': { backgroundColor: theme.palette.background.hover },
        '&:hover .titulo-noticia': { color: theme.palette.primary.main },
      }}
    >
      {news.imageUrl && (
        <Box
          sx={{
            flexShrink: 0,
            width: 64,
            height: 64,
            borderRadius: 2,
            backgroundImage: `url(${news.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 500 }}
        >
          {dataDaNoticia(news)}
          {/* anúncio restrito a um evento: quem lê só chegou aqui porque está
              nele, e saber de qual se trata evita confusão com outro cursilho */}
          {news.event && ` · ${news.event.name}`}
        </Typography>
        <Typography
          className="titulo-noticia"
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            lineHeight: 1.35,
            transition: theme.transitions.create('color', { duration: 160 }),
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {news.title}
        </Typography>
        {news.summary && (
          <Typography
            sx={{
              mt: 0.25,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {news.summary}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/**
 * Mural de notícias ao lado dos eventos.
 *
 * Fica em coluna estreita de propósito: é recado curto (inscrições abertas,
 * mudança de local, aviso da secretaria), e quem entra na tela vem pelos
 * eventos. O texto inteiro abre em modal, sem trocar de página.
 */
function NewsFeed() {
  const theme = useTheme();
  const { data, isLoading } = useGetNews({ take: LIMITE_DO_FEED });
  const [aberta, setAberta] = useState<News | null>(null);

  const noticias = Array.isArray(data) ? data : [];

  return (
    <Paper sx={{ borderRadius: 3, p: 2 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          }}
        >
          <CampaignOutlined sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
          Notícias
        </Typography>
      </Stack>

      {isLoading ? (
        <Stack gap={2}>
          {[0, 1, 2].map((posicao) => (
            <Stack direction="row" gap={1.5} key={posicao}>
              <Skeleton
                variant="rectangular"
                sx={{ borderRadius: 2, width: 64, height: 64, flexShrink: 0 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width={70} height={12} />
                <Skeleton width="80%" height={20} />
                <Skeleton width="60%" height={16} />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : noticias.length === 0 ? (
        <Typography
          sx={{ fontSize: '0.875rem', color: 'text.secondary', py: 1 }}
        >
          Nenhuma notícia por aqui ainda. Os avisos da secretaria aparecem neste
          espaço.
        </Typography>
      ) : (
        <Stack divider={<Divider flexItem />} gap={1}>
          {noticias.map((news) => (
            <ItemDoFeed
              key={news.id}
              news={news}
              onClick={() => setAberta(news)}
            />
          ))}
        </Stack>
      )}

      <NewsModal news={aberta} onClose={() => setAberta(null)} />
    </Paper>
  );
}

export { NewsFeed };
