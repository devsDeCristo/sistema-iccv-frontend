import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
} from '@mui/material';
import { Download } from '@mui/icons-material';

interface ModalQrCodeProps {
  open: boolean;
  handleClose: () => void;
}

function ModalQrCode({ open, handleClose }: ModalQrCodeProps) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string>('');
  const theme = useTheme();
  const colorMode = theme.palette.mode;
  const downloadQRCode = () => {
    const canvas = qrRef.current;
    if (!canvas) return;

    // Criar um canvas temporário com maior resolução para download
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Definir tamanho maior para melhor qualidade (800x800)
    const downloadSize = 800;
    tempCanvas.width = downloadSize;
    tempCanvas.height = downloadSize;

    // Desenhar o QR code no canvas temporário com maior resolução
    tempCtx.imageSmoothingEnabled = false; // Manter pixels nítidos
    tempCtx.drawImage(canvas, 0, 0, downloadSize, downloadSize);

    const url = tempCanvas.toDataURL('image/png', 1.0); // qualidade máxima
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setUrl('');
        handleClose();
      }}
      maxWidth="sm"
      sx={{
        minWidth: '340px',
      }}
      fullWidth
    >
      <DialogTitle sx={{ pb: 0 }}>Gerar QR Code</DialogTitle>
      <DialogContent sx={{ mt: 0, height: 'fit-content' }}>
        <TextField
          label="Insira a URL para gerar o QR Code"
          fullWidth
          margin="normal"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {url ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div>
              <QRCodeCanvas
                value={url}
                size={400}
                bgColor={colorMode === 'dark' ? '#ffffff' : '#EDEDED'}
                fgColor={'#000000'}
                level={'H'}
                ref={qrRef}
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  width: '100%',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, pt: 0 }}>
        <Button
          onClick={() => {
            setUrl('');
            handleClose();
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!url}
          onClick={downloadQRCode}
          startIcon={<Download />}
        >
          Baixar QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default ModalQrCode;
