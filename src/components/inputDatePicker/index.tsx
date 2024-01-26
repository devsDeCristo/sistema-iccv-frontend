import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';

interface InputDatePickerProps {
  label: string;
  errorMessage?: string;
}

const InputDatePicker = ({
  label,
  errorMessage,
  ...rest
}: InputDatePickerProps & DatePickerProps<Date>) => {
  return (
    <div>
      <DatePicker
        sx={{
          width: '100%',
        }}
        slotProps={{
          textField: {
            helperText: errorMessage,
          },
        }}
        label={label}
        {...rest}
      />
    </div>
  );
};

export { InputDatePicker };
