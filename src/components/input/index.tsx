import { TextField, TextFieldProps } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';

interface InputProps {
  name: string;
  label: string;
}

function Input({ name, label, ...rest }: InputProps & TextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextField
          label={label}
          sx={{
            width: '100%',
          }}
          value={value}
          onChange={onChange}
          variant="outlined"
          {...rest}
        />
      )}
    />
  );
}

export { Input };
