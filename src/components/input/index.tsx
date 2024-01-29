import { TextField, TextFieldProps } from '@mui/material';

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
