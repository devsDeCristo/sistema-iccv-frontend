import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import ReactQuillViewer from '../../../components/reactQuill';
import { News } from '../types';
import { dataDaNoticia } from '../utils';

/** Notícia inteira. O texto vem do editor, então é renderizado pelo viewer. */
function NewsModal({
  news,
  onClose,
}: {
  news: News | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!news}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {news && (
        <>
          {news.imageUrl && (
            <Box
              component="img"
              src={news.imageUrl}
              alt={news.title}
              sx={{ width: '100%', maxHeight: 260, objectFit: 'cover' }}
            />
          )}

          <DialogContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1}
            >
              <Box>
                <Typography
                  sx={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 }}
                >
                  {news.title}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                  }}
                >
                  {dataDaNoticia(news)}
                  {news.author?.fullName ? ` · ${news.author.fullName}` : ''}
                </Typography>
              </Box>

              <IconButton onClick={onClose} size="small" aria-label="Fechar">
                <Close />
              </IconButton>
            </Stack>

            <Box
              sx={{
                mt: 2,
                // o viewer do quill traz borda e padding próprios, que aqui
                // seriam uma caixa dentro do modal
                '& .ql-container': { border: 'none', fontSize: '0.9375rem' },
                '& .ql-editor': { p: 0 },
              }}
            >
              <ReactQuillViewer value={news.content} />
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export { NewsModal };
