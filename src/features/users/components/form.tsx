import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { InputSelect } from '../../../components/inputSelect';

function Form() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Input name="fullName" required label="Nome completo" />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="email" required label="E-mail" />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="cpf" required label="CPF" />
      </Grid>

      <Grid item xs={12} md={6}>
        <InputDatePicker name="fullName" label="Data de nascimento" />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="cellphone" required label="Celular" />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="religion" required label="Religiao" />
      </Grid>
      <Grid item xs={12} md={6}>
        <Input
          required
          name="notes"
          label="Observações"
          placeholder="Insira aqui caso tenha alguma alergia ou algo parecido"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect name="diabetic"  label="Possui Diabetes?" />
      </Grid>
    </Grid>
  );
}

export { Form };
