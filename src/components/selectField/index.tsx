import { MenuItem, TextField, TextFieldProps } from '@mui/material';

export interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  /**
   * No celular vale abrir o seletor nativo do sistema: ele é mais confortável
   * que o menu do MUI em tela pequena.
   */
  native?: boolean;
}

type Props = SelectFieldProps &
  Omit<TextFieldProps, 'onChange' | 'value' | 'select' | 'label'>;

function SelectField({
  label,
  value,
  onChange,
  options,
  native = false,
  ...rest
}: Props) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      SelectProps={{ native }}
      {...rest}
    >
      {options.map((option) =>
        native ? (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ) : (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        )
      )}
    </TextField>
  );
}

export { SelectField };
