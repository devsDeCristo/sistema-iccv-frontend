import { Check } from '@mui/icons-material';
import { Alert, Box, Button, Stack } from '@mui/material';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import {
  describeCameraError,
  isSecureCameraContext,
} from '../../../../utils/camera';

interface WebCamUploadProps {
  onSelectPhoto: (data: File) => void;
  /** Stream ao vivo da câmera, para espelhar a captura em outra tela */
  onStream?: (stream: MediaStream | null) => void;
  /** Foto congelada entre o "Capturar" e o "Usar foto" */
  onCapture?: (file: File | null) => void;
}

/**
 * A mídia é 16:9 e maior que o modal. Limitar só a largura deixava a altura
 * estourar, então ela é limitada pelas duas dimensões e se ajusta à menor.
 */
const mediaStyle = {
  display: 'block',
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  borderRadius: 4,
} as const;

/** Ocupa toda a altura livre do modal e centraliza a mídia dentro dela */
const mediaAreaSx = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function WebcamUpload({
  onSelectPhoto,
  onStream,
  onCapture,
}: WebCamUploadProps) {
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const webcamRef = useRef(null);
  /**
   * Antes esta falha era silenciosa — só um retângulo preto. Servindo o sistema
   * por IP em HTTP o navegador não expõe a câmera e nem pede permissão, então a
   * tela precisa dizer isso em vez de deixar o operador tentando de novo.
   */
  const [erroCamera, setErroCamera] = useState<string | null>(
    isSecureCameraContext() ? null : describeCameraError()
  );

  const capturedImageUrl = useMemo(
    () => (capturedImage ? URL.createObjectURL(capturedImage) : null),
    [capturedImage]
  );

  useEffect(() => {
    if (!capturedImageUrl) return;
    return () => URL.revokeObjectURL(capturedImageUrl);
  }, [capturedImageUrl]);

  // quem embute o componente reflete a captura em outra tela; o arquivo é o
  // mesmo, então lá a URL é recriada sem depender desta, que é revogada aqui
  useEffect(() => {
    onCapture?.(capturedImage);
  }, [capturedImage]);

  const generateRandomFileName = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `webcam-${randomString}.jpg`;
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      (webcamRef.current as any).getScreenshot();
      (webcamRef.current as any).canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const fileName = generateRandomFileName();
          const file = new File([blob], fileName, {
            type: 'image/jpeg',
          });
          setCapturedImage(file);
        }
      }, 'image/jpeg');
    }
  }, [webcamRef]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  return (
    <Stack gap={2} sx={{ flex: 1, minHeight: 0 }}>
      {capturedImage && capturedImageUrl ? (
        <>
          <Box sx={mediaAreaSx}>
            <Box
              component="img"
              src={capturedImageUrl}
              alt="Foto capturada"
              sx={mediaStyle}
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setCapturedImage(null);
              }}
            >
              Nova foto
            </Button>
            <Button
              variant="contained"
              endIcon={<Check />}
              onClick={() => onSelectPhoto(capturedImage)}
            >
              Usar foto
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Box sx={mediaAreaSx}>
            {erroCamera ? (
              <Alert severity="error">{erroCamera}</Alert>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={mediaStyle}
                onUserMedia={(stream) => onStream?.(stream)}
                onUserMediaError={(erro) => {
                  setErroCamera(describeCameraError(erro));
                  onStream?.(null);
                }}
              />
            )}
          </Box>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={capturePhoto}
              disabled={!!erroCamera}
            >
              Capturar foto
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

export { WebcamUpload };
