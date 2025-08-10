import { Grid } from '@mui/material';
import { Input } from '../../../../components/input';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { RegisterEventFormType } from '../types';
import { onlyNumber } from '../../../../utils';

function Form() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RegisterEventFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              required
              label="Nome do evento"
              error={!!errors.name}
              errorMessage={errors.name?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              error={!!errors.price}
              errorMessage={errors.price?.message}
              onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              label="Preço"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="workerPrice"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={(event) => onChange(onlyNumber(event.target.value))}
              required
              error={!!errors.workerPrice}
              errorMessage={errors.workerPrice?.message}
              label="Preço para quem vai trabalhar"
            />
          )}
        />
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
      </Grid>
    </Grid>
  );
}

export { Form };
