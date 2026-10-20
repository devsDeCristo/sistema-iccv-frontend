import {
  Box,
  Checkbox,
  Chip,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { iconeDeFiltro } from '../../../../components/filtroDeLista';

interface FiltroMultiploProps<T extends string> {
  label: string;
  opcoes: { value: T; label: string }[];
  value: T[];
  onChange: (valor: T[]) => void;
  sx?: object;
}

/**
 * Filtro de várias opções, sem "Todos": nada marcado é o mesmo que todos, e o
 * campo diz isso. Marcar uma opção é restringir; desmarcar tudo é voltar ao
 * começo — uma opção "Todos" ao lado das outras se contradiria assim que se
 * marcasse uma delas.
 */
export function FiltroMultiplo<T extends string>({
  label,
  opcoes,
  value,
  onChange,
  sx,
}: FiltroMultiploProps<T>) {
  return (
    <TextField
      select
      label={label}
      variant="outlined"
      size="small"
      value={value}
      sx={{
        ...sx,
        // com chips de 22px o campo mantém a altura dos outros (40px)
        '& .MuiSelect-select': { py: '8.5px', minHeight: 'unset' },
      }}
      // o rótulo fica sempre no alto: com o campo vazio ele cobriria o "Todos"
      InputLabelProps={{ shrink: true }}
      // o funil dos selects de filtro das barras de lista
      InputProps={{ startAdornment: iconeDeFiltro }}
      SelectProps={{
        multiple: true,
        displayEmpty: true,
        renderValue: (marcados) => {
          const escolhidos = opcoes.filter((opcao) =>
            (marcados as T[]).includes(opcao.value)
          );
          // as escolhidas em chips pequenos, na ordem das opções; o campo cresce
          // com eles (ver `sx` de quem usa) e quebra a linha se não couberem.
          // Todas marcadas filtra o mesmo que nenhuma, e o campo diz o mesmo
          return escolhidos.length && escolhidos.length < opcoes.length ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {escolhidos.map((opcao) => (
                <Chip
                  key={opcao.value}
                  size="small"
                  label={opcao.label}
                  sx={{
                    height: 22,
                    fontSize: 12,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography component="span" sx={{ fontSize: 14 }}>
              Todos
            </Typography>
          );
        },
      }}
      onChange={(e) => onChange(e.target.value as unknown as T[])}
    >
      {opcoes.map((opcao) => (
        <MenuItem key={opcao.value} value={opcao.value} dense>
          <Checkbox
            size="small"
            checked={value.includes(opcao.value)}
            sx={{ py: 0.25 }}
          />
          <ListItemText primary={opcao.label} />
        </MenuItem>
      ))}
    </TextField>
  );
}
