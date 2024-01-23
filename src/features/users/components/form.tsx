import { Button, Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { InputSelect } from '../../../components/inputSelect';
import { useEffect, useState } from 'react';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { RegisterUsersFormType } from '../types';
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
const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};
const optionsBoolean = [
  { value: 0, name: 'Não' },
  { value: 1, name: 'Sim' },
];
const optionsProfession = [
  { value: 'Cursilhista', name: 'Participar (Cursilhista)' },
  { value: 'Cursilheiro(a)', name: 'Servir (Cursilheiro)' },
];
const optionsRole = [
  { value: 0, name: 'Não' },
  { value: 1, name: 'Pastor' },
  { value: 5, name: 'Membro(a)' },
];
function Form() {
  const [cpf, setCpf] = useState<string>('');
  const [inputCpf, setInputCpf] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [birthday, setBirthday] = useState<Date | null>(new Date());
  const [email, setEmail] = useState<string>('');
  const [cellphone, setCellphone] = useState<string>('');
  const [inputCellphone, setInputCellphone] = useState<string>('');
  const [religion, setReligion] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [diabetic, setDiabetic] = useState<unknown>();
  const [hypertensive, setHypertensive] = useState<unknown>();
  const [indicateBy, setIndicateBy] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [inputEmergencyContact, setInputEmergencyContact] =
    useState<string>('');
  const [profession, setProfession] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [role, setRole] = useState<unknown>();
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
        <InputDatePicker
          name="birthday"
          label="Data de nascimento"
          value={birthday}
          onChange={(newValue) => {
            setBirthday(newValue);
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input
          name="cellphone"
          required
          label="Celular"
          value={inputCellphone}
          onChange={(event) => {
            setInputCellphone(maskPhone(event.target.value));
            setCellphone(removeMask(maskPhone(event.target.value)));
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="religion" required label="Religiao" />
      </Grid>

      <Grid item xs={12} md={6}>
        <InputSelect
          name="diabetic"
          label="Possui Diabetes?"
          menuOptions={optionsBoolean}
          value={diabetic}
          onChange={(event) => {
            setDiabetic(event.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect
          name="hypertensive"
          label="Possui Hispertensão?"
          menuOptions={optionsBoolean}
          value={hypertensive}
          onChange={(event) => {
            setHypertensive(event.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Input
          required
          name="notes"
          value={notes}
          onChange={(event) => {
            setNotes(event.target.value);
          }}
          label="Observações"
          placeholder="Insira aqui caso tenha alguma alergia ou algo parecido"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Input
          name="emergencyContact"
          required
          label="Contato de Emergência"
          value={inputEmergencyContact}
          onChange={(event) => {
            setInputEmergencyContact(maskPhone(event.target.value));
            setEmergencyContact(removeMask(maskPhone(event.target.value)));
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Input
          name="indicateBy"
          required
          label="Foi indicado por alguem? Se sim, quem?"
          value={indicateBy}
          onChange={(event) => {
            setIndicateBy(event.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect
          name="profession"
          label="Vai participar ou servir no cursilho?"
          menuOptions={optionsProfession}
          value={profession}
          onChange={(event) => {
            setProfession(event.target.value as string);
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect
          name="role"
          label="Possui ministerio na igreja? Qual?"
          menuOptions={optionsRole}
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Input
          name="city"
          required
          label="Cidade"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Input
          name="state"
          required
          label="Estado"
          value={state}
          onChange={(event) => {
            setState(event.target.value);
          }}
        />
      </Grid>
    </Grid>
  );
}

export { Form };
