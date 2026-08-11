import { Check } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface WebCamUploadProps {
  onSelectPhoto: (data: File) => void;
}

function WebcamUpload({ onSelectPhoto }: WebCamUploadProps) {
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const webcamRef = useRef(null);

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
    <div>
      {capturedImage ? (
        <>
          <img src={URL.createObjectURL(capturedImage)} alt="Captured" />
          <Button
            variant="contained"
            component="label"
            onClick={() => {
              setCapturedImage(null);
            }}
          >
            Nova foto
          </Button>
          <Button
            variant="contained"
            component="label"
            endIcon={<Check />}
            onClick={() => onSelectPhoto(capturedImage)}
          >
            Usar foto
          </Button>
        </>
      ) : (
        <>
          <Webcam
            audio={false}
            height={450}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={730}
            videoConstraints={videoConstraints}
          />
          <Button variant="contained" component="label" onClick={capturePhoto}>
            Capturar foto
          </Button>
        </>
      )}
    </div>
  );
}

export { WebcamUpload };
