import { Grid, Typography } from '@mui/material';
import { Input } from '../../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { InputSelect } from '../../../../components/inputSelect';
import { OPTIONS_STATUS } from '../constants';
import { GeneralInfoFormType } from '../types';

function FormGeneralInfo() {
  const {
    control,
    formState: { errors },
  } = useFormContext<GeneralInfoFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={'18px'}>
          Informações Gerais do Evento
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              value={value}
              onChange={onChange}
              // required
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
              size="small"
              label="Status do evento"
              menuOptions={OPTIONS_STATUS}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <Controller
          control={control}
          name="shortDescription"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              value={value}
              onChange={onChange}
              // required
              label="Descrição curta"
              error={!!errors.shortDescription}
              errorMessage={errors.shortDescription?.message}
            />
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={12}>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              value={value}
              onChange={onChange}
              // required
              multiline
              rows={4}
              label="Descrição Detalhada"
              error={!!errors.description}
              errorMessage={errors.description?.message}
            />
          )}
        />
      </Grid>
      {/* <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="eventType"
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Categoria do evento"
              menuOptions={OPTIONS_EVENT_TYPE}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </Grid> */}
      <Grid item xs={12} md={12}>
        <Controller
          control={control}
          name="groupLink"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
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

export { FormGeneralInfo };
