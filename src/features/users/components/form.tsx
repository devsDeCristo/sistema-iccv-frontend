import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { InputSelect } from '../../../components/inputSelect';
import { Controller, useFormContext } from 'react-hook-form';
import { RegisterUsersFormType } from '../../../types/user';
import { formatCPF, formatPhoneNumber, formatState } from '../../../utils';
import { OPTIONS_BOOLEAN, OPTIONS_LEADERSHIP } from '../constants';

function Form() {
  const {
    control,
    formState: { errors },
  } = useFormContext<RegisterUsersFormType>();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
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

      <Grid item xs={12} md={4}>
        <Controller
          control={control}
          name="badgeName"
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              required
              label="Nome do crachá"
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
              onChange={(event) => onChange(formatCPF(event.target.value))}
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
              onChange={(event) =>
                onChange(formatPhoneNumber(event.target.value))
              }
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="profession"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              required
              label="Profissão"
              value={value}
              error={!!errors.profession}
              errorMessage={errors.profession?.message}
              onChange={onChange}
            />
          )}
        />
      </Grid>

      {/* <Grid item xs={12} md={6}>
        <Controller
          name="worker"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Vai participar ou servir no cursilho?"
              menuOptions={OPTIONS_WORKER}
              value={value}
              required
              onChange={onChange}
            />
          )}
        />
      </Grid> */}

      <Grid item xs={12} md={6}>
        <Controller
          name="diabetes"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Possui Diabetes?"
              menuOptions={OPTIONS_BOOLEAN}
              value={value}
              onChange={onChange}
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
              menuOptions={OPTIONS_BOOLEAN}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="neighborhood"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input required label="Bairro" value={value} onChange={onChange} />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="city"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input required label="Cidade" value={value} onChange={onChange} />
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
              label="Estado - (RN)"
              value={value}
              onChange={(event) =>
                onChange(formatState(event.target.value)?.toUpperCase())
              }
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
              onChange={(event) =>
                onChange(formatPhoneNumber(event.target.value))
              }
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
              label="Foi indicado por alguem? Se sim, quem?"
              value={value}
              onChange={onChange}
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
          name="leadershipPosition"
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputSelect
              label="Possui ministerio na igreja? Qual?"
              menuOptions={OPTIONS_LEADERSHIP}
              value={value}
              onChange={onChange}
              helperText={errors.leadershipPosition?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="notes"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Input
              value={value}
              onChange={onChange}
              label="Observações"
              placeholder="Insira aqui caso tenha alguma alergia ou algo parecido"
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

export { Form };
