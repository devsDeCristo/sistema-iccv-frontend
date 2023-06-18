import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';

function Form() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Input name="name" required label="Nome do evento" />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="pice" required label="Preço" />
      </Grid>

      <Grid item xs={12} md={6}>
        <InputDatePicker name="startDate" label="Data Inicial" />
      </Grid>

      <Grid item xs={12} md={6}>
        <InputDatePicker name="endDate" label="Data Final" />
      </Grid>
    </Grid>
  );
}

export { Form };
