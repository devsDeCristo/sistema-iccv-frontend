import { Grid } from '@mui/material';
import { Input } from '../../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { RegistrationSettingsFormType } from '../types';
import { onlyNumber } from '../../../../utils';

function FormRegistrationSettings() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RegistrationSettingsFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="capacity"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              error={!!errors.capacity}
              errorMessage={errors.capacity?.message}
              label="Capacidade máxima de inscrições para fazer"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="capacityWorker"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              error={!!errors.capacityWorker}
              errorMessage={errors.capacityWorker?.message}
              label="Capacidade máxima de inscrições para trabalhar"
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

export { FormRegistrationSettings };
