import {
  Box,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { Input } from '../../../../components/input';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { DateAndLocalFormType } from '../types';
import { CancelOutlined, Clear, Place } from '@mui/icons-material';
import GoogleMap from '../../../../components/mapWord';
import { formatZipCode, removeMask } from '../../../../utils';

function FormDateAndLocal() {
  const {
    control,
    setError,
    setValue,
    formState: { errors },
  } = useFormContext<DateAndLocalFormType>();
  const linkMaps = useWatch({ control, name: 'linkMaps' });
  const fetchAddressByCep = async (cep: string) => {
    try {
      const cleanCep = cep.replace(/\D/g, '');

      if (cleanCep.length !== 8) return;

      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );

      const data = await response.json();

      if (data.erro) {
        setError('zipCode', {
          type: 'manual',
          message: 'CEP não encontrado.',
        });
        return;
      }

      setValue('address', data.logradouro || '');
      setValue('neighborhood', data.bairro || '');
      setValue('city', data.localidade || '');
      setValue('state', data.uf || '');
    } catch (error) {
      setError('zipCode', {
        type: 'manual',
        message: 'Falha ao buscar o CEP.',
      });
      // Toast('error', 'Erro', 'Falha ao buscar o CEP.');
    }
  };
  const extractGoogleMapsSrc = (input?: string): string | null | undefined => {
    if (!input) return null;

    // Caso já seja um link direto
    if (input.startsWith('http')) {
      return input;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'text/html');
      const iframe = doc.querySelector('iframe');

      return iframe?.getAttribute('src') ?? null;
    } catch {
      return null;
    }
  };
  const theme = useTheme();
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={18}>
          Data
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="startDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputDatePicker
              label="Data Inicial"
              value={value as unknown as Date}
              onChange={onChange}
              errorMessage={errors.startDate?.message}
              slotProps={{ textField: { size: 'small', required: true } }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="endDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputDatePicker
              label="Data Final"
              value={value as unknown as Date}
              onChange={onChange}
              errorMessage={errors.endDate?.message}
              slotProps={{ textField: { size: 'small', required: true } }}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={18}>
          Local
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Controller
          name="localName"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              label="Nome do Local"
              value={value}
              onChange={onChange}
              error={!!errors.localName}
              errorMessage={errors.localName?.message}
            />
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={12}>
        <Typography variant="subtitle1">
          Informações de endereço(opcional)
        </Typography>
      </Grid>{' '}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Controller
            name="zipCode"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                size="small"
                label="CEP"
                placeholder="00000-000"
                value={formatZipCode(value)}
                onChange={(e) => {
                  const cep = removeMask(e.target.value);
                  onChange(cep);
                  fetchAddressByCep(cep);
                }}
                error={!!errors.zipCode}
                errorMessage={errors.zipCode?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Controller
            name="address"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                size="small"
                label="Endereço"
                value={value}
                onChange={onChange}
                error={!!errors.address}
                errorMessage={errors.address?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="city"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                size="small"
                label="Cidade"
                value={value}
                onChange={onChange}
                error={!!errors.city}
                errorMessage={errors.city?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="neighborhood"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                size="small"
                label="Bairro"
                value={value}
                onChange={onChange}
                error={!!errors.neighborhood}
                errorMessage={errors.neighborhood?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="number"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                size="small"
                label="Número"
                value={value}
                onChange={onChange}
                error={!!errors.number}
                errorMessage={errors.number?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <Controller
            name="linkMaps"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                size="small"
                label="Link do Maps"
                value={value}
                onChange={(e) => {
                  const extractedUrl = extractGoogleMapsSrc(e.target.value);
                  onChange(extractedUrl);
                }}
                placeholder="Cole o link do Google Maps ou o código de incorporação (embed)"
                // error={
                //   !!errors.linkMaps ||
                //   (value && !value.includes('https://www.google.com/maps'))
                // }
                error={!!errors.linkMaps}
                errorMessage={errors.linkMaps?.message}
                {...(value
                  ? {
                      InputProps: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {errors.linkMaps ? (
                              <CancelOutlined color="error" />
                            ) : (
                              <Tooltip title="Limpar">
                                <IconButton
                                  // href={value}
                                  // target="_blank"
                                  sx={{ '&:hover': { color: 'error.main' } }}
                                  onClick={() => {
                                    onChange('');
                                  }}
                                >
                                  <Clear />
                                </IconButton>
                              </Tooltip>
                            )}
                          </InputAdornment>
                        ),
                      },
                    }
                  : null)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          {linkMaps ? (
            <>
              <GoogleMap linkMap={linkMaps} width={'100%'} />
              <Typography variant="body2" color="textSecondary">
                Esse mapa é apenas uma pré-visualização. Interagir não irá
                alterar o link acima.
              </Typography>
            </>
          ) : (
            <Box
              sx={{
                border: '1px dashed',
                borderColor: theme.palette.text.secondary,
                borderRadius: 1,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
                padding: 4,
                textAlign: 'center',
              }}
            >
              <Place
                sx={{ fontSize: 50, color: theme.palette.text.secondary }}
              />
              <Typography variant="body1" color="textPrimary">
                Insira o link do Google Maps para visualizar o mapa aqui.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Vá até o Google Maps, encontre o local desejado, clique em
                "Compartilhar" e depois na aba "Incorporar um mapa". Copie o
                código fornecido e cole no campo acima.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export { FormDateAndLocal };
