import {
  Backdrop,
  Box,
  Fade,
  IconButton,
  Modal,
  Stack,
  Typography,
  Tooltip,
} from '@mui/material';
import { Close, Download } from '@mui/icons-material';

interface ReceiptPreviewModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export function ReceiptPreviewModal({
  open,
  onClose,
  imageUrl,
}: ReceiptPreviewModalProps) {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'comprovante.png'; // nome sugerido
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Stack
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            {/* Botões topo direito */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: 'absolute',
                top: -50,
                right: 0,
              }}
            >
              <Tooltip title="Baixar comprovante">
                <IconButton onClick={handleDownload} sx={{ color: '#fff' }}>
                  <Download />
                </IconButton>
              </Tooltip>

              <Tooltip title="Fechar">
                <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                  <Close />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Imagem */}
            <Box
              component="img"
              src={imageUrl}
              alt="Comprovante"
              sx={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 12,
                bgcolor: '#111',
              }}
            />

            <Typography
              mt={1}
              textAlign="center"
              fontSize={13}
              color="rgba(255,255,255,0.6)"
            >
              Clique no ícone para baixar o comprovante
            </Typography>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
}
