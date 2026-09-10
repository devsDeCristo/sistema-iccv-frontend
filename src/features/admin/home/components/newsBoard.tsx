import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowForward, CampaignOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cardTabelaSx } from '../../../../components/listPageStyles';
import { formatDate } from '../../../../utils';
import { NewsBoard as NewsBoardData } from '../types';
import { SecaoDaHome } from './secao';

interface NewsBoardProps {
  news: NewsBoardData;
}

/**
 * O mural da igreja: o que foi anunciado por último e o que ficou pela metade.
 *
 * O rascunho tem lugar de destaque de propósito — notícia escrita e não
 * publicada é a que ninguém lembra que existe, porque some no meio das
 * publicadas na tela de notícias.
 */
export function NewsBoard({ news }: NewsBoardProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <SecaoDaHome
      titulo="Mural"
      acao={
        <Button
          size="small"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/admin/noticias')}
          sx={{ textTransform: 'none' }}
        >
          Ver todas
        </Button>
      }
    >
      <Card elevation={0} sx={{ ...cardTabelaSx, height: '100%' }}>
        {news.drafts > 0 && (
          <Stack
            component="button"
            type="button"
            onClick={() => navigate('/admin/noticias')}
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              width: '100%',
              border: 0,
              cursor: 'pointer',
              font: 'inherit',
              color: 'inherit',
              textAlign: 'left',
              px: 2,
              py: 1.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.chips.pending, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.chips.pending, 0.18) },
            }}
          >
            <CampaignOutlined
              sx={{ fontSize: 18, color: theme.palette.chips.pending }}
            />
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {news.drafts} rascunho(s) sem publicar
            </Typography>
          </Stack>
        )}

        {news.items.length === 0 ? (
          /*
            O mural vazio ganha um convite, e não uma frase de ausência: o
            recurso é novo e quem abre o painel não sabe que ele existe.
          */
          <Stack alignItems="center" gap={1} sx={{ py: 4.5, px: 2 }}>
            <CampaignOutlined sx={{ fontSize: 32, color: 'text.disabled' }} />
            <Typography color="text.secondary" fontSize={14}>
              Nenhuma notícia publicada ainda.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/admin/noticias')}
              sx={{ mt: 0.5, textTransform: 'none', borderRadius: 2 }}
            >
              Publicar a primeira
            </Button>
          </Stack>
        ) : (
          news.items.map((noticia) => (
            <Stack
              key={noticia.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
              sx={{
                px: 2,
                py: 1.4,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                '&:last-of-type': { borderBottom: 'none' },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>
                  {noticia.title}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {noticia.publishedAt
                    ? formatDate(new Date(noticia.publishedAt))
                    : 'sem data'}
                </Typography>
              </Box>

              {/* sem evento é aviso geral, que vai para o mural de todo mundo */}
              <Chip
                size="small"
                variant={noticia.eventName ? 'filled' : 'outlined'}
                label={noticia.eventName ?? 'Aviso geral'}
                sx={{
                  flexShrink: 0,
                  maxWidth: 180,
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            </Stack>
          ))
        )}
      </Card>
    </SecaoDaHome>
  );
}
