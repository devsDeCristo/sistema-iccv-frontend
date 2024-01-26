import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { InputSelect } from '../../../components/inputSelect';
import { Controller, useFormContext } from 'react-hook-form';
import { RegisterUsersFormType } from '../../../types/user';
const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};
const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})(\d+?)$/, '$1');
};

const optionsBoolean = [
  { value: 0, name: 'Não' },
  { value: 1, name: 'Sim' },
];
const optionsWorker = [
  { value: 0, name: 'Participar (Cursilhista)' },
  { value: 1, name: 'Servir (Cursilheiro)' },
];
const optionsRole = [
  { value: 0, name: 'Não' },
  { value: 1, name: 'Pastor' },
  { value: 5, name: 'Membro(a)' },
];
function Form() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RegisterUsersFormType>();

  console.log(errors);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              required
              label="Nome completo"
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input value={value} onChange={onChange} required label="E-mail" />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="cpf"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              required
              label="CPF"
              value={value}
              error={!!errors.cpf}
              errorMessage={errors.cpf?.message}
              onChange={(event) => onChange(maskCPF(event.target.value))}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="birthday"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputDatePicker
              label="Data de nascimento"
              value={value as unknown as Date}
              onChange={onChange}
              errorMessage={errors.birthday?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="cellphone"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              required
              label="Celular"
              value={value}
              error={!!errors.cellphone}
              errorMessage={errors.cellphone?.message}
              onChange={(event) => onChange(maskPhone(event.target.value))}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="religion"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Religião"
              value={value}
              error={!!errors.cpf}
              errorMessage={errors.religion?.message}
              onChange={onChange}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="diabetes"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Possui Diabetes?"
              menuOptions={optionsBoolean}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="hypertensive"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Possui Hispertensão?"
              menuOptions={optionsBoolean}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="notes"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              label="Observações"
              placeholder="Insira aqui caso tenha alguma alergia ou algo parecido"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="emergencyContact"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              label="Contato de Emergência"
              value={value}
              onChange={(event) => onChange(maskPhone(event.target.value))}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="indicatedBy"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              // required
              label="Foi indicado por alguem? Se sim, quem?"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="worker"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Vai participar ou servir no cursilho?"
              menuOptions={optionsWorker}
              value={value}
              required
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="leadershipPosition"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Possui ministerio na igreja? Qual?"
              menuOptions={optionsRole}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="city"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              required
              label="Cidade"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="state"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              required
              label="Estado"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

export { Form };
