import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PictureAsPdfOutlined, UploadFileOutlined } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CURRICULO_MAXIMO_BYTES, LIMITES, REDES } from '../formulario';
import { Campo } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any -- o valor muda de forma com o tipo do campo */

/** Um campo do formulário, pelo tipo */
export function CampoDoFormulario({
  campo,
  valor,
  onChange,
  curriculo,
  onCurriculo,
}: {
  campo: Campo;
  valor: any;
  onChange: (v: any) => void;
  curriculo: File | null;
  onCurriculo: (f: File | null) => void;
}) {
  const rotulo = campo.rotulo;
  const required = campo.obrigatorio;

  switch (campo.tipo) {
    case 'CURRICULO':
      return (
        <Stack spacing={0.75}>
          <FormLabel required={required}>{rotulo}</FormLabel>
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
            <Button
              component="label"
              variant="outlined"
              startIcon={
                curriculo ? <PictureAsPdfOutlined /> : <UploadFileOutlined />
              }
              sx={{ textTransform: 'none' }}
            >
              {curriculo ? 'Trocar arquivo' : 'Escolher PDF'}
              <input
                hidden
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  if (arquivo && arquivo.type !== 'application/pdf') {
                    toast.error('O currículo tem que ser um PDF');
                  } else if (arquivo && arquivo.size > CURRICULO_MAXIMO_BYTES) {
                    toast.error('O currículo vai até 5 MB');
                  } else onCurriculo(arquivo);
                }}
              />
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {curriculo ? curriculo.name : 'PDF, até 5 MB'}
            </Typography>
          </Stack>
        </Stack>
      );
    case 'PRETENSAO_SALARIAL': {
      const faixa = valor ?? {};
      const numero = (chave: 'min' | 'max', rotuloDoCampo: string) => (
        <TextField
          label={rotuloDoCampo}
          type="number"
          value={faixa[chave] ?? ''}
          onChange={(e) => onChange({ ...faixa, [chave]: e.target.value })}
          inputProps={{ min: 0, step: 50 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">R$</InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
      );
      return (
        <Stack spacing={0.75}>
          <FormLabel required={required}>{rotulo}</FormLabel>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
            {numero('min', 'Valor (ou mínimo)')}
            {numero('max', 'Máximo (opcional)')}
          </Stack>
        </Stack>
      );
    }
    case 'MENSAGEM':
    case 'TEXTO': {
      const limite =
        campo.tipo === 'MENSAGEM' ? LIMITES.mensagem : LIMITES.texto;
      return (
        <TextField
          label={rotulo}
          InputLabelProps={{ required }}
          placeholder={
            campo.tipo === 'MENSAGEM'
              ? 'Conte quem você é e por que quer a vaga'
              : undefined
          }
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{ maxLength: limite }}
          helperText={`${(valor ?? '').length}/${limite}`}
          multiline
          minRows={campo.tipo === 'MENSAGEM' ? 4 : 2}
        />
      );
    }
    case 'REDE_SOCIAL':
      return (
        <TextField
          label={rotulo}
          InputLabelProps={{ required }}
          placeholder={campo.rede ? REDES[campo.rede].placeholder : undefined}
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{ maxLength: 300, inputMode: 'url' }}
        />
      );
    case 'SELECAO':
      return (
        <TextField
          select
          label={rotulo}
          InputLabelProps={{ required }}
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {!required && (
            <MenuItem value="">
              <em>Nenhuma</em>
            </MenuItem>
          )}
          {campo.opcoes?.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      );
    case 'OPCAO_UNICA':
      return (
        <FormControl>
          <FormLabel required={required}>{rotulo}</FormLabel>
          <RadioGroup
            value={valor ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {campo.opcoes?.map((o) => (
              <FormControlLabel
                key={o}
                value={o}
                control={<Radio />}
                label={o}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    case 'CAIXAS': {
      const marcadas: string[] = valor ?? [];
      return (
        <FormControl>
          <FormLabel required={required}>{rotulo}</FormLabel>
          <FormGroup>
            {campo.opcoes?.map((o) => (
              <FormControlLabel
                key={o}
                label={o}
                control={
                  <Checkbox
                    checked={marcadas.includes(o)}
                    onChange={(e) =>
                      onChange(
                        e.target.checked
                          ? [...marcadas, o]
                          : marcadas.filter((m) => m !== o)
                      )
                    }
                  />
                }
              />
            ))}
          </FormGroup>
        </FormControl>
      );
    }
  }
}
