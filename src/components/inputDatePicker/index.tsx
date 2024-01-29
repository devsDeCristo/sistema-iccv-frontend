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
    <DatePicker
      sx={{
        width: '100%',
      }}
      format="dd/MM/yyyy"
      slotProps={{
        textField: {
          helperText: errorMessage,
        },
      }}
      label={label}
      {...rest}
    />
  );
};

export { InputDatePicker };
