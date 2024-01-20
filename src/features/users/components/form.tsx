import { Grid } from '@mui/material';
import { Input } from '../../../components/input';
import { InputDatePicker } from '../../../components/inputDatePicker';
import { InputSelect } from '../../../components/inputSelect';
import { useState } from 'react';

const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const removeMask = (value: string): string => {
  return value.replace(/\D/g, "");
};

function Form() {
  const [cpf,setCpf]=useState<string>("");
  const [inputCpf,setInputCpf]=useState<string>("");
  const [fullName,setFullName]=useState<string>("");
  const [eamil,setEmailCpf]=useState<string>("");
  //const [inputCpf,setInputCpf]=useState<string>("");
  //const [inputCpf,setInputCpf]=useState<string>("");

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Input name="fullName" required label="Nome completo" onChange={(event)=>{
          setFullName(event.target.value)}}/>
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="email" required label="E-mail" />
      </Grid>

      <Grid item xs={12} md={6}>
        <Input name="cpf" required label="CPF" value={inputCpf} onChange={(event)=>{
          setCpf(removeMask(maskCPF(event.target.value)));
          setInputCpf(maskCPF(event.target.value));
        }} />
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
          //onChange={(e)=>{console.log(e.target.value);}}
          label="Observações"
          placeholder="Insira aqui caso tenha alguma alergia ou algo parecido"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect name="diabetic"  label="Possui Diabetes?" />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect name="diabetic"  label="Possui Diabetes?" />
      </Grid>
      <Grid item xs={12} md={6}>
        <InputSelect name="indicateBy"  label="Possui Diabetes?" />
      </Grid>
    </Grid>
  );
}

export { Form };
const user =	{
  "id": 5,
  "email": "edudamaris33@gmail.com",
  "fullName": "Eduarda Dâmaris Lima Diógenes",
  "cpf": "70025784480",
  "birthday": "2004-06-09T00:00:00.000Z",
  "cellphone": "84994669886",
  "worker": false,
  "diabetes": false,
  "hypertensive": false,
  "profession": "Cursilhista",
  "city": "Parnamirim",
  "state": "RN",
  "role": 5,
  "profilePhotoUrl": null,
  "emergencyContact": null,
  "indicatedBy": null,
  "leadershipPosition": null,
  "religion": null,
  "notes": null,
  "createdAt": "2023-09-24T19:18:57.540Z",
  "updateAt": "2023-09-24T19:17:35.946Z"
}