import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';

interface InputDatePickerProps {
  name: string;
  label: string;
}

const InputDatePicker = ({
  name,
  label,
  ...rest
}: InputDatePickerProps & DatePickerProps<Date>) => {
  const { control } = useForm();

  return (
    <div>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            sx={{
              width: '100%',
            }}
            label={label}
            value={value}
            onChange={onChange}
            {...rest}
          />
        )}
      />
    </div>
  );
};

export { InputDatePicker };
