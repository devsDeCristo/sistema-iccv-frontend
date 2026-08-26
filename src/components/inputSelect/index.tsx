import { useId } from 'react';
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
  sx,
  ...rest
}: InputSelectProps & SelectProps) => {
  // um id por instância: com o id fixo, clicar no rótulo de um select abria o
  // primeiro da tela
  const labelId = useId();

  return (
    <div>
      <FormControl fullWidth>
        {/* sem repassar o tamanho, o rótulo do select pequeno fica desalinhado */}
        <InputLabel id={labelId} size={rest.size === 'small' ? 'small' : 'normal'}>
          {label}
        </InputLabel>
        <Select
          /**
           * O sx de quem chama entra somando, não substituindo: antes ele vinha
           * no `...rest` depois desta prop e apagava a largura, então quem
           * passasse estilo perdia o `width: 100%`.
           */
          sx={[{ width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}
          labelId={labelId}
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
