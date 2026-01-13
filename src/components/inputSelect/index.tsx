import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material';

interface InputSelectProps {
  label: string;
  menuOptions: { value: any; name: string }[];
  helperText?: string;
  errorMessage?: string;
}

const InputSelect = ({
  label,
  menuOptions,
  helperText,
  errorMessage,
  ...rest
}: InputSelectProps & SelectProps) => {
  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="select-label">{label}</InputLabel>
        <Select
          sx={{
            width: '100%',
          }}
          labelId="select-label"
          label={label}
          displayEmpty
          {...rest}
        >
          {menuOptions.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
    </div>
  );
};

export { InputSelect };
