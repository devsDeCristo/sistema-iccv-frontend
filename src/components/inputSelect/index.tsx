import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface InputSelectProps {
  name: string;
  label: string;
}

const InputSelect = ({ name, label }: InputSelectProps) => {
  const { control } = useForm();

  return (
    <div>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">{label}</InputLabel>
              <Select
                sx={{
                  width: '100%',
                }}
                label={label}
                value={value}
                //onOpen={open}
                //onClose={handleClose}
                //onOpen={handleOpen}
                onChange={onChange}
              >
                <MenuItem value={false}>Não</MenuItem>
                <MenuItem value={true}>Sim</MenuItem>
              </Select>
        </FormControl>
        )}
      />
    </div>
  );
};

export { InputSelect };
