import {
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { Input } from '../../../../components/input';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { DateAndLocalFormType } from '../types';
import { CancelOutlined, Launch } from '@mui/icons-material';
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
  return (
    <Grid container spacing={2}>
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
              onChange={onChange}
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
                            <Tooltip title="Abrir no Google Maps">
                              <IconButton
                                href={value}
                                target="_blank"
                                onClick={() => {}}
                              >
                                <Launch />
                              </IconButton>
                            </Tooltip>
                          )}
                        </InputAdornment>
                      ),
                    },
                  }
                : null)}

              //  ...(value? {InputProps: {
              //     endAdornment: (
              //       <InputAdornment position="end">
              //         <IconButton href={value} onClick={() => {}}>
              //           <Launch />
              //         </IconButton>
              //       </InputAdornment>
              //     ),
              //   }}:null)
            />
          )}
        />
      </Grid>
      {linkMaps && <GoogleMap linkMap={linkMaps} />}
    </Grid>
  );
}

export { FormDateAndLocal };
