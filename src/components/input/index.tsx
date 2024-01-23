import { TextField, TextFieldProps } from '@mui/material';
import { useFormContext, Controller, Control } from 'react-hook-form';

interface InputProps {
  label: string;
  errorMessage?: string;
}

function Input({ label, errorMessage, ...rest }: InputProps & TextFieldProps) {
  return (
    <TextField
      helperText={errorMessage}
      label={label}
      sx={{
        width: '100%',
      }}
      variant="outlined"
      {...rest}
    />
  );
}

export { Input };
