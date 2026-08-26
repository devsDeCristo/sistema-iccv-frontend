import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { ResponsiveModal } from '../responsiveModal';
import {
  describeCameraError,
  isSecureCameraContext,
} from '../../utils/camera';

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  /** Chamado uma única vez por leitura, com o conteúdo cru do QR */
  onRead: (value: string) => void;
  title?: string;
  /** Texto de apoio abaixo do vídeo */
  helperText?: string;
}

/**
 * Intervalo entre tentativas de decodificar. O jsQR gasta algumas dezenas de ms
 * num quadro 720p; 200ms mantém a leitura instantânea na percepção do operador
 * sem fritar a CPU do celular segurando a câmera aberta.
 */
const SCAN_INTERVAL_MS = 200;

/** Traseira no celular; no desktop o navegador cai na única câmera que existe */
const VIDEO_CONSTRAINTS = {
  facingMode: 'environment',
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

/**
 * Modal de bipagem: aponta a câmera para o QR do crachá e devolve o conteúdo.
 *
 * A leitura roda em intervalo sobre o quadro corrente do `react-webcam` — o
 * mesmo componente do posto de foto —, então não há um segundo jeito de abrir
 * câmera no sistema.
 */
function QrScannerModal({
  open,
  onClose,
  onRead,
  title = 'Bipar QR Code',
  helperText,
}: QrScannerModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const [erroCamera, setErroCamera] = useState<string | null>(null);
  // fora de contexto seguro não vale nem montar o vídeo: o navegador não tem a
  // API e a falha viria sem explicação
  const cameraDisponivel = isSecureCameraContext();
  /**
   * Um QR fica vários quadros na frente da câmera. Sem esta trava o mesmo
   * código seria entregue dezenas de vezes até o modal fechar.
   */
  const jaLeu = useRef(false);

  useEffect(() => {
    if (!open) return;
    jaLeu.current = false;
    setErroCamera(cameraDisponivel ? null : describeCameraError());
  }, [open, cameraDisponivel]);

  const tentarLer = useCallback(() => {
    if (jaLeu.current) return;

    const canvas = webcamRef.current?.getCanvas();
    if (!canvas) return;

    const contexto = canvas.getContext('2d');
    if (!contexto) return;

    const quadro = contexto.getImageData(0, 0, canvas.width, canvas.height);
    // o QR do crachá é escuro sobre claro: não vale gastar um segundo passe
    // procurando a versão invertida
    const lido = jsQR(quadro.data, quadro.width, quadro.height, {
      inversionAttempts: 'dontInvert',
    });
    if (!lido?.data) return;

    jaLeu.current = true;
    onRead(lido.data);
  }, [onRead]);

  useEffect(() => {
    if (!open || erroCamera) return;
    const timer = setInterval(tentarLer, SCAN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [open, erroCamera, tentarLer]);

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      mobileMode="bottomSheet"
      title={title}
      actions={
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      }
    >
      <Stack gap={2}>
        {erroCamera ? (
          <Alert severity="error">{erroCamera}</Alert>
        ) : (
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'common.black',
              // a mídia é 16:9; o wrapper segura a proporção para o modal não
              // pular de altura quando o vídeo engata
              aspectRatio: '4 / 3',
            }}
          >
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={VIDEO_CONSTRAINTS}
              onUserMediaError={(erro) => setErroCamera(describeCameraError(erro))}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* alvo: sem ele o operador não sabe onde encostar o crachá */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                aspectRatio: '1 / 1',
                border: '3px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                opacity: 0.9,
              }}
            />
          </Box>
        )}
        <Typography variant="caption" color="text.secondary">
          {helperText ||
            'Aponte a câmera para o QR Code impresso no crachá. A busca é preenchida sozinha na leitura.'}
        </Typography>
      </Stack>
    </ResponsiveModal>
  );
}

export { QrScannerModal };
