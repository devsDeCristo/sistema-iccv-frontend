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

    const url = canvas.toDataURL('image/png'); // gera base64
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <div style={{ textAlign: 'center', padding: 20 }}>
          {url ? (
            <QRCodeCanvas
              value={url}
              size={200}
              bgColor={colorMode === 'dark' ? '#ffffff' : '#EDEDED'}
              fgColor={'#000000'}
              level={'H'}
              ref={qrRef}
            />
          ) : null}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, pt: 0 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        {/* {url ? ( */}
        <Button
          variant="contained"
          disabled={!url}
          onClick={downloadQRCode}
          startIcon={<Download />}
        >
          Baixar QR Code
        </Button>
        {/* ) : null} */}
      </DialogActions>
    </Dialog>
  );
}
export default ModalQrCode;
