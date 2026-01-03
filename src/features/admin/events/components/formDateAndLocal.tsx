import {
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { Input } from '../../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { DateAndLocalFormType } from '../types';
import { CancelOutlined, Launch } from '@mui/icons-material';

function FormDateAndLocal() {
  const {
    control,
    formState: { errors },
  } = useFormContext<DateAndLocalFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6">Data</Typography>
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
            />
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={12}>
        <Typography variant="h6">Local</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="localName"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Nome do Local"
              value={value}
              onChange={onChange}
              error={!!errors.localName}
              errorMessage={errors.localName?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="city"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Cidade"
              value={value}
              onChange={onChange}
              error={!!errors.city}
              errorMessage={errors.city?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="neighborhood"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Bairro"
              value={value}
              onChange={onChange}
              error={!!errors.neighborhood}
              errorMessage={errors.neighborhood?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="number"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
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
    </Grid>
  );
}

export { FormDateAndLocal };
