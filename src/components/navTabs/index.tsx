import { ReactElement } from 'react';
import {
  Paper,
  SxProps,
  Tab,
  Tabs,
  Theme,
  useMediaQuery,
  useTheme,
} from '@mui/material';

export interface NavTabOption<T> {
  value: T;
  label: string;
  /** Ícone à esquerda do rótulo; o Tab do MUI só aceita elemento ou string */
  icon?: ReactElement;
}

interface NavTabsProps<T> {
  value: T;
  onChange: (value: T) => void;
  options: NavTabOption<T>[];
  /**
   * As abas dividem a largura em partes iguais no desktop, como nas abas de
   * grupo. Sem isso a régua ocupa só a largura do conteúdo.
   */
  fullWidth?: boolean;
  /** Sem a superfície própria, para abas que já estão dentro de um Paper */
  bare?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Abas de navegação do sistema.
 *
 * Existiam seis réguas de abas em telas diferentes, três delas com cópias
 * locais do estilo — e os raios já tinham divergido, 5px num lado e 12px no
 * outro. O componente é o único lugar que sabe como uma aba se parece.
 *
 * O formato é pílula: o indicador sublinhado do MUI sai e quem marca a aba
 * ativa é o fundo.
 */
export function NavTabs<T extends string | number>({
  value,
  onChange,
  options,
  fullWidth = false,
  bare = false,
  sx,
}: NavTabsProps<T>) {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('md'));

  // no celular a régua rola; dividir em partes iguais só cabe no desktop
  const variant = fullWidth && md ? 'fullWidth' : 'scrollable';

  const abas = (
    <Tabs
      /**
       * A troca de `variant` não é aplicada num Tabs já montado: sem a key ele
       * continua rolando quando deveria dividir a largura.
       */
      key={variant}
      value={value}
      variant={variant}
      scrollButtons={variant === 'scrollable' ? 'auto' : false}
      allowScrollButtonsMobile
      onChange={(_, novo) => onChange(novo as T)}
      sx={{
        minHeight: 40,
        '& button': {
          color: theme.palette.text.disabled,
          textTransform: 'capitalize',
          minHeight: 36,
          borderRadius: 2,
          paddingX: 1.5,
        },
        '& .MuiTab-icon': { marginRight: '4px' },
        '& button.Mui-selected': {
          // a aba ativa também muda de cor: só o fundo deixava o texto apagado
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.hover,
        },
        '& .MuiTabs-indicator': { display: 'none' },
      }}
    >
      {options.map((option) => (
        <Tab
          key={String(option.value)}
          value={option.value}
          label={option.label}
          icon={option.icon}
          iconPosition={option.icon ? 'start' : undefined}
        />
      ))}
    </Tabs>
  );

  if (bare) return abas;

  return (
    <Paper
      sx={[
        {
          borderRadius: 3,
          p: 0.5,
          width: fullWidth ? '100%' : 'fit-content',
          maxWidth: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {abas}
    </Paper>
  );
}
