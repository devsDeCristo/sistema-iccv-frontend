import {
  alpha,
  Box,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Controller,
  FieldPath,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { EventLogoFormType } from '../types';
import { Close, Upload } from '@mui/icons-material';
import { useCallback, useMemo, useRef, useState } from 'react';
import Resizer from 'react-image-file-resizer';
import { toast } from 'react-toastify';

function FormLogoAndCover() {
  const {
    control,
    setError,
    setValue,
    formState: { errors },
  } = useFormContext<EventLogoFormType>();

  const fileInputRefLogo = useRef<HTMLInputElement>(null);
  const fileInputRefCover = useRef<HTMLInputElement>(null);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  // const [logoPreview, setLogoPreview] = useState<string | null>(null);
  // const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const logo = useWatch({ control, name: 'eventLogo' });
  const cover = useWatch({ control, name: 'eventCover' });
  const logoPreview = useMemo(() => {
    if (!logo || !logo[0]) return null;
    return URL.createObjectURL(logo[0]);
  }, [logo]);

  const coverPreview = useMemo(() => {
    if (!cover || !cover[0]) return null;
    return URL.createObjectURL(cover[0]);
  }, [cover]);

  const handleDragOver = useCallback(
    (e: React.DragEvent, field: FieldPath<EventLogoFormType>) => {
      e.preventDefault();
      if (field === 'eventLogo') {
        setIsDraggingLogo(true);
      } else {
        setIsDraggingCover(true);
      }
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent, field: FieldPath<EventLogoFormType>) => {
      e.preventDefault();
      if (field === 'eventLogo') {
        setIsDraggingLogo(false);
      } else {
        setIsDraggingCover(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, field: FieldPath<EventLogoFormType>) => {
      e.preventDefault();
      if (field === 'eventLogo') {
        setIsDraggingLogo(false);
      } else {
        setIsDraggingCover(false);
      }

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        handleImageChange(file, field);
      }
    },
    []
  );
  const handleButtonClick = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.value = ''; // zera antes de abrir
      ref.current.click();
    }
  };
  const handleImageChange = (
    file: File | null,
    field: FieldPath<EventLogoFormType>
  ) => {
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
            setValue(field, value);
            return value;
          } else {
            setError(field, {
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
        setError(field, {
          type: 'manual',
          message: 'Erro ao ler o arquivo.',
        });
        toast.error('Falha ao ler o arquivo.');
        // notify("Error: " + error, "error");
      };
    } else {
      setError(field, {
        type: 'manual',
        message: 'Por favor, selecione um arquivo de imagem válido.',
      });

      toast.error('Por favor, selecione um arquivo de imagem válido.');
    }
  };
  const theme = useTheme();
  const styles = {
    box: (isDragging: boolean) => ({
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
    }),
    uploadIcon: (isDragging: boolean) => ({
      fontSize: 35,
      mx: 'auto',
      color: isDragging
        ? theme.palette.text.primary
        : theme.palette.text.secondary,
    }),
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
        render={({ field: { onChange } }) => (
          <input
            ref={fileInputRefLogo}
            hidden
            type="file"
            accept="image/svg+xml"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              // handleLogoChange(file);
              onChange(file ? [file] : null);
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
      {logo && logo[0] && logoPreview ? (
        <Box
          sx={{
            // position: 'relative',
            width: '100%',
            // maxWidth: 200,
            border: `1px solid ${theme.palette.divider}`,
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            justifyContent: 'space-between',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={logoPreview}
              alt="Preview da logo"
              sx={{
                // width: '100%',
                width: 150,
                height: 'auto',
                maxHeight: 200,
                objectFit: 'contain',
                borderRadius: 2,
                p: 2,
                bgcolor: theme.palette.background.default,
              }}
            />

            <Box
              className="flex-1"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                justifyContent: 'center',
              }}
            >
              <Typography fontWeight={500} fontSize={'16px'}>
                {logo[0]?.name ? logo[0].name : 'Logo atual'}
              </Typography>
              <Typography
                fontSize={'14px'}
                sx={{ color: alpha(theme.palette.text.primary, 0.7) }}
              >
                {logo[0]?.size && `${(logo[0]?.size / 1024).toFixed(1)} KB`}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Remover imagem">
            <IconButton
              onClick={() => {
                setValue('eventLogo', null);
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
          {/* <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => handleButtonClick(fileInputRefLogo)}
          >
            Alterar Logo
          </Button> */}
        </Box>
      ) : (
        <Box
          onClick={() => handleButtonClick(fileInputRefLogo)}
          onDragOver={(e) => handleDragOver(e, 'eventLogo')}
          onDragLeave={(e) => handleDragLeave(e, 'eventLogo')}
          onDrop={(e) => handleDrop(e, 'eventLogo')}
          sx={styles.box(isDraggingLogo)}
        >
          <Upload sx={styles.uploadIcon(isDraggingLogo)} />
          <Typography sx={styles.text}>
            Clique ou arraste a imagem para fazer upload
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
      )}
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={18}>
          Capa
        </Typography>
      </Grid>
      <Controller
        name="eventCover"
        control={control}
        render={({ field: { onChange } }) => (
          <input
            hidden
            ref={fileInputRefCover}
            type="file"
            accept="image/svg+xml"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0] || null;
              // handleLogoChange(file);
              onChange(file ? [file] : null);
            }}
          />
        )}
      />

      {cover && cover[0] && coverPreview ? (
        <Box
          sx={{
            // position: 'relative',
            width: '100%',
            // maxWidth: 200,
            border: `1px solid ${theme.palette.divider}`,
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            justifyContent: 'space-between',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={coverPreview}
              alt="Preview da capa"
              sx={{
                // width: '100%',
                width: 150,
                height: 'auto',
                maxHeight: 200,
                objectFit: 'contain',
                borderRadius: 2,
                // height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 2,
                bgcolor: theme.palette.background.default,
              }}
            />

            <Box
              className="flex-1"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                justifyContent: 'center',
              }}
            >
              <Typography fontWeight={500} fontSize={'16px'}>
                {cover[0]?.name ? cover[0].name : 'Capa atual'}
              </Typography>
              <Typography
                fontSize={'14px'}
                sx={{ color: alpha(theme.palette.text.primary, 0.7) }}
              >
                {cover[0]?.size && `${(cover[0]?.size / 1024).toFixed(1)} KB`}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Remover imagem">
            <IconButton
              onClick={() => {
                setValue('eventCover', null);
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
          {/* <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => handleButtonClick(fileInputRefLogo)}
          >
            Alterar Logo
          </Button> */}
        </Box>
      ) : (
        <Box
          onClick={() => handleButtonClick(fileInputRefCover)}
          onDragOver={(e) => handleDragOver(e, 'eventCover')}
          onDragLeave={(e) => handleDragLeave(e, 'eventCover')}
          onDrop={(e) => handleDrop(e, 'eventCover')}
          sx={styles.box(isDraggingCover)}
        >
          <Upload sx={styles.uploadIcon(isDraggingCover)} />
          <Typography sx={styles.text}>
            Clique ou arraste a imagem para fazer upload
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
      )}
      {errors.eventCover && (
        <Grid item xs={12}>
          <Typography color="error" variant="caption">
            {typeof errors.eventCover?.message === 'string'
              ? errors.eventCover.message
              : ''}
          </Typography>
        </Grid>
      )}
      {errors.eventLogo && (
        <Grid item xs={12}>
          <Typography color="error" variant="caption">
            {typeof errors.eventLogo?.message === 'string'
              ? errors.eventLogo.message
              : ''}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}

export { FormLogoAndCover };
