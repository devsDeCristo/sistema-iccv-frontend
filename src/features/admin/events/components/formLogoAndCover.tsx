import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Input } from '../../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { EventLogoFormType } from '../types';
import { Upload } from '@mui/icons-material';
import { useRef, useState } from 'react';
import Resizer from 'react-image-file-resizer';
import { toast } from 'react-toastify';

function FormLogoAndCover() {
  const {
    control,
    setError,
    setValue,
    formState: { errors },
  } = useFormContext<EventLogoFormType>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Adicione lógica de upload aqui
  };
  const handleLogoChange = (file: File | null) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      Resizer.imageFileResizer(
        file,
        500,
        500,
        'SVG',
        80,
        0,
        (value: string | File | Blob | ProgressEvent<FileReader>) => {
          if (typeof value === 'string') {
            // setLogoPreview(value);
            // setValue('eventCover', value);
            return value;
          } else {
            setError('eventCover', {
              type: 'manual',
              message: 'Erro ao redimensionar a imagem.',
            });
            console.error('Unexpected value type:', value);
            toast.error('Erro ao redimensionar a imagem.');
          }
        },
        'base64',
        500,
        500
      );

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        // Você pode adicionar lógica adicional aqui, se necessário
      };
      fileReader.onerror = (error) => {
        console.error('Error:', error);
        setError('eventCover', {
          type: 'manual',
          message: 'Erro ao ler o arquivo.',
        });
        toast.error('Falha ao ler o arquivo.');
        // notify("Error: " + error, "error");
      };
    } else {
      setError('eventCover', {
        type: 'manual',
        message: 'Por favor, selecione um arquivo de imagem válido.',
      });
      toast.error('Por favor, selecione um arquivo de imagem válido.');
    }
  };
  const theme = useTheme();
  const styles = {
    box: {
      border: 2,
      borderStyle: 'dashed',
      borderRadius: 2,
      borderColor: isDragging
        ? theme.palette.primary.main
        : theme.palette.divider,
      bgcolor: isDragging ? `${theme.palette.action.hover}` : 'transparent',
      p: 3,
      width: '100%',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:hover': {
        borderColor: theme.palette.primary.main,
        bgcolor: theme.palette.action.hover,
      },
    },
    uploadIcon: {
      fontSize: 35,
      mx: 'auto',
      color: isDragging
        ? theme.palette.text.primary
        : theme.palette.text.secondary,
    },
    text: {
      fontSize: '0.875rem',
      fontWeight: 500,
      mb: 0.5,
    },
  };
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={18}>
          Logo
        </Typography>
      </Grid>
      <Controller
        name="eventLogo"
        control={control}
        render={({ field: { onChange, value } }) => (
          <input
            hidden
            type="file"
            accept="image/svg+xml"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              // handleLogoChange(file);
              onChange(file);
            }}
            // error={!!errors.eventCover}
            // errorMessage={
            //   typeof errors.eventCover?.message === 'string'
            //     ? errors.eventCover.message
            //     : undefined
            // }
          />
        )}
      />

      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={styles.box}
      >
        <Upload sx={styles.uploadIcon} />
        <Typography sx={styles.text}>
          Clique para fazer upload ou arraste a imagem
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
          }}
        >
          SVG (limite: 5MB)
        </Typography>
      </Box>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={18}>
          Capa
        </Typography>
      </Grid>
      <Controller
        name="eventCover"
        control={control}
        render={({ field: { onChange, value } }) => (
          <input
            hidden
            type="file"
            accept="image/svg+xml"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              // handleLogoChange(file);
              onChange(file);
            }}
            // error={!!errors.eventCover}
            // errorMessage={
            //   typeof errors.eventCover?.message === 'string'
            //     ? errors.eventCover.message
            //     : undefined
            // }
          />
        )}
      />

      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={styles.box}
      >
        <Upload sx={styles.uploadIcon} />
        <Typography sx={styles.text}>
          Clique para fazer upload ou arraste a imagem
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: theme.palette.text.secondary,
          }}
        >
          SVG (limite: 5MB)
        </Typography>
      </Box>
    </Grid>
  );
}

export { FormLogoAndCover };
