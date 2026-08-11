import { Avatar, Box, Button, Stack } from '@mui/material';
import { CameraAlt, UploadFile } from '@mui/icons-material';
const stylesInput = {
  button: {
    position: 'relative',
    width: '150px',
    height: '150px',
    '&.hover': {
      boxShadow: 'none',
    },
    '&:hover': {
      zIndex: 1,
      filter: 'brightness(50%)',
      ' & .MuiImageMarked-root': {
        opacity: 0.9,
      },
    },
  },
  box: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opactiy: 0,
    color: 'white',
  },
  cameraAlt: {
    opacity: 0,
    '&.hover': {
      boxShadow: 'none',
    },
  },
  avatar: {
    width: '150px',
    height: '150px',
  },
};
interface InputPhotoProps {
  profilePhoto: string | undefined;
  /** Preview da foto escolhida e ainda não enviada ao servidor */
  previewPhoto?: string;
  onSelectPhoto: (data: File) => void;
  onOpenWebcam: () => void;
  /** Só exibe a foto, sem permitir troca */
  readOnly?: boolean;
}
function InputPhoto({
  profilePhoto,
  previewPhoto,
  onSelectPhoto,
  onOpenWebcam,
  readOnly = false,
}: InputPhotoProps) {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectPhoto(file);
    }
    // permite escolher o mesmo arquivo novamente
    e.target.value = '';
  };

  if (readOnly) {
    return (
      <Stack direction="row" alignItems="center" marginY={2}>
        <Avatar
          variant="rounded"
          src={previewPhoto || profilePhoto || undefined}
          sx={stylesInput.avatar}
        />
      </Stack>
    );
  }

  return (
    <Stack direction="row" alignItems="center" gap={3} marginY={2}>
      <Button
        focusRipple
        key={'random'}
        component="label"
        sx={stylesInput.button}
      >
        <Avatar
          variant="rounded"
          src={previewPhoto || profilePhoto || undefined}
          sx={stylesInput.avatar}
        />
        <Box sx={stylesInput.box}>
          <CameraAlt
            className="MuiImageMarked-root"
            fontSize="large"
            sx={[
              stylesInput.cameraAlt,
              {
                height: '60px',
                width: 'auto',
              },
            ]}
          />
        </Box>
        <input
          hidden
          accept=".png, .jpg, .jpeg"
          type="file"
          onChange={handleFileInputChange}
        />
      </Button>

      <Stack gap={1} alignItems="stretch">
        <Button
          variant="contained"
          startIcon={<CameraAlt />}
          onClick={onOpenWebcam}
        >
          Abrir webcam
        </Button>
        <Button variant="outlined" component="label" startIcon={<UploadFile />}>
          Selecionar arquivo
          <input
            hidden
            accept=".png, .jpg, .jpeg"
            type="file"
            onChange={handleFileInputChange}
          />
        </Button>
      </Stack>
    </Stack>
  );
}

export { InputPhoto };
