import { Grid } from '@mui/material';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { DateAndTimeFormType } from '../types';

function FormDateAndTime() {
  const {
    control,
    formState: { errors },
  } = useFormContext<DateAndTimeFormType>();

  return (
    <Grid container spacing={2}>
   
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

export { FormDateAndTime };
