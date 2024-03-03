import { Avatar, Box, Button, Stack } from '@mui/material';
import { CameraAlt, Save } from '@mui/icons-material';
import { useState } from 'react';
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
  onSavePhoto: (data: File | null) => void;
}
function InputPhoto({ profilePhoto, onSavePhoto }: InputPhotoProps) {
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<string | undefined>(profilePhoto);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(file, reader.result);
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Stack
      justifyContent={'center'}
      alignItems={'center'}
      margin={2}
      gap={4}
      direction={'row'}
    >
      <Button
        focusRipple
        key={'random'}
        component="label"
        sx={stylesInput.button}
      >
        <Avatar
          variant="rounded"
          src={photo || undefined}
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
      <Button
        variant="contained"
        component="label"
        endIcon={<Save />}
        onClick={() => onSavePhoto(file)}
      >
        Salvar
      </Button>
    </Stack>
  );
}

export { InputPhoto };
