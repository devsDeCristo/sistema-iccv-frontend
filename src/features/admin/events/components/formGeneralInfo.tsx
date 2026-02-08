import { Grid, Typography } from '@mui/material';
import { Input } from '../../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { InputSelect } from '../../../../components/inputSelect';
import { OPTIONS_STATUS } from '../constants';
import { GeneralInfoFormType } from '../types';
import 'react-quill/dist/quill.snow.css';
import ReactQuillEditor from '../../../../components/reactQuillEditor';
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
              inputProps={{ maxLength: 100 }}
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
              size="small"
              label="Status do evento"
              menuOptions={OPTIONS_STATUS}
              value={value}
              onChange={onChange}
              error={!!errors.isActive}
              errorMessage={errors.isActive?.message}
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
              size="small"
              value={value}
              inputProps={{ maxLength: 200 }}
              onChange={onChange}
              label="Link do grupo de whatsapp"
              error={!!errors.groupLink}
              errorMessage={errors.groupLink?.message}
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
              inputProps={{ maxLength: 100 }}
              // required
              label="Descrição curta"
              helperText={`${value?.length || 0}/100 caracteres`}
              error={!!errors.shortDescription}
              errorMessage={errors.shortDescription?.message}
            />
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={12}>
        <Typography variant="subtitle1" fontSize={'16px'} mb={1}>
          Descrição detalhada
        </Typography>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <ReactQuillEditor key={'quill'} value={value} onChange={onChange} />
          )}
        />
      </Grid>
    </Grid>
  );
}

export { FormGeneralInfo };
