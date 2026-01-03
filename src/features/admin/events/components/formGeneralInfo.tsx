import { Grid } from '@mui/material';
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
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              // required
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

export { FormGeneralInfo };
