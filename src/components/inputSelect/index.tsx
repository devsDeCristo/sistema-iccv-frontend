import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface InputSelectProps {
  name: string;
  label: string;
  menuOptions: { value: string | number; name: string }[];
}

const InputSelect = ({
  name,
  label,
  menuOptions,
  ...rest
}: InputSelectProps & SelectProps) => {
  const { control } = useForm();

  return (
    <div>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <FormControl fullWidth>
            <InputLabel id="select-label">{label}</InputLabel>
            <Select
              sx={{
                width: '100%',
              }}
              labelId="select-label"
              label={label}
              value={value}
              onChange={onChange}
              displayEmpty
              {...rest}
            >
              {menuOptions.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </div>
  );
};

export { InputSelect };
