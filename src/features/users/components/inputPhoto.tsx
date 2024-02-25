import { Avatar, Button, Grid, IconButton, Stack } from '@mui/material';
import { Input } from '../../../components/input';
import { PhotoCamera } from '@mui/icons-material';
import { useState } from 'react';

function InputPhoto() {
  const [photo, setPhoto] = useState<string | null>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Armazena os dados da foto como uma URL base64
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Stack
      justifyContent={'center'}
      alignItems={'center'}
      direction="column"
      margin={2}
      gap={2}
    >
      <Avatar
        variant="rounded"
        src={photo || undefined}
        sx={{
          width: '180px',
          height: '180px',
        }}
      />
      <Button
        variant="contained"
        component="label"
        //sx={styles.ButtonFoto}
      >
        <PhotoCamera />
        Adicionar foto
        <input
          hidden
          accept=".png, .jpg, .jpeg"
          type="file"
          onChange={handleFileInputChange}
        />
      </Button>
    </Stack>
  );
}

export { InputPhoto };
