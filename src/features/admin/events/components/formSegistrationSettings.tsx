import { Grid } from '@mui/material';
import { Input } from '../../../../components/input';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { RegisterEventFormType, RegistrationSettingsFormType } from '../types';
import { onlyNumber } from '../../../../utils';
import { InputSelect } from '../../../../components/inputSelect';
import { OPTIONS_STATUS } from '../constants';

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
      </Grid>{' '}
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="isActive"
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Status do evento"
              menuOptions={OPTIONS_STATUS}
              value={value}
              onChange={onChange}
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
        <Controller
          control={control}
          name="groupLink"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="Link do grupo de whatsapp"
              error={!!errors.groupLink}
              errorMessage={errors.groupLink?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

export { FormRegistrationSettings };
