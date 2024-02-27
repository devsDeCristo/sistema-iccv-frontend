import { Avatar, Box, Button, Stack } from '@mui/material';
import { CameraAlt, Save } from '@mui/icons-material';
import { useState } from 'react';
import { usePostProfilePhotoUser } from '../api/postProfilePhotoUser';
const stylesInput = {
  button: {
    position: 'relative',
    width: '180px',
    height: '180px',
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
    //color: 'white',
    opacity: 0,
    '&.hover': {
      boxShadow: 'none',
    },
  },
  avatar: {
    width: '180px',
    height: '180px',
  },
};
function InputPhoto(data: any) {
  const [file, setFile] = useState<File | null>(data.profilePhotoUrl);
  const [photo, setPhoto] = useState<string | null>(null);
  const { mutate: savePhoto } = usePostProfilePhotoUser();

  if (!data || Array.isArray(data)) {
    return null;
  }
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

  const handleSaveButtonClick = () => {
    if (data?.id && file) {
      const formData = new FormData();
      formData.append('photo', file);
      savePhoto({ userId: data.id, data: formData });
    }
  };

  return (
    <Stack justifyContent={'center'} alignItems={'center'} margin={2} gap={2}>
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
        onClick={handleSaveButtonClick}
      >
        Salvar
      </Button>
    </Stack>
  );
}

export { InputPhoto };
