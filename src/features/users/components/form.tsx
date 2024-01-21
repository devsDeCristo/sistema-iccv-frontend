import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { InputSelect } from '../../../components/inputSelect';
import { useEffect, useState } from 'react';

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
  { value: '', name: 'Não' },
  { value: 'sd', name: 'Sim' },
];
const optionsProfession = [
  { value: 'Cursilhista', name: 'Participar (Cursilhista)' },
  { value: 'Cursilheiro(a)', name: 'Servir (Cursilheiro)' },
];
const optionsRole = [
  { value: '0', name: 'Não' },
  { value: '1', name: 'Pastor' },
  { value: '5', name: 'Membro(a)' },
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
  const [diabetic, setDiabetic] = useState<boolean>(false);
  const [hypertensive, setHypertensive] = useState<boolean>(false);
  const [indicateBy, setIndicateBy] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [inputEmergencyContact, setInputEmergencyContact] =
    useState<string>('');
  const [profession, setProfession] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [role, setRole] = useState<number>();
  useEffect(() => {
    console.log(cpf, inputCpf, cellphone, inputCellphone);
  }, [cpf, inputCpf, cellphone, inputCellphone]);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Input
          name="fullName"
          required
          label="Nome completo"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input
          name="email"
          required
          label="E-mail"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input
          name="cpf"
          required
          label="CPF"
          value={inputCpf}
          onChange={(event) => {
            setCpf(removeMask(maskCPF(event.target.value)));
            setInputCpf(maskCPF(event.target.value));
          }}
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
        <Input
          name="religion"
          required
          label="Religiao"
          value={religion}
          onChange={(event) => {
            setReligion(event.target.value);
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <InputSelect
          name="diabetic"
          label="Possui Diabetes?"
          menuOptions={optionsBoolean}
          value={diabetic}
          onChange={(event) => {
            setDiabetic(event.target.value as boolean);
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
            setHypertensive(event.target.value as boolean);
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
            setRole(event.target.value as number);
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
const user = {
  id: 5,
  email: 'edudamaris33@gmail.com', //
  fullName: 'Eduarda Dâmaris Lima Diógenes', //
  cpf: '70025784480', //
  birthday: '2004-06-09T00:00:00.000Z', //
  cellphone: '84994669886', //
  worker: false,
  diabetes: false, //
  hypertensive: false, //
  profession: 'Cursilhista', //falar com felipe
  city: 'Parnamirim',
  state: 'RN',
  role: 5,
  profilePhotoUrl: null, //
  emergencyContact: null, //
  indicatedBy: null, //
  leadershipPosition: null,
  religion: null, //
  notes: null, //
  createdAt: '2023-09-24T19:18:57.540Z',
  updateAt: '2023-09-24T19:17:35.946Z',
};
