import { Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { SelectRoleFormType } from '../types';

function FormSelectRole() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SelectRoleFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={'18px'}>
          Informações Gerais do Evento
        </Typography>
      </Grid>
    </Grid>
  );
}

export { FormSelectRole };
