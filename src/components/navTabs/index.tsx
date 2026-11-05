import { ReactElement } from 'react';
import {
  alpha,
  Box,
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
  /** Número num chip depois do rótulo (quantos itens a aba tem) */
  contagem?: number;
}

interface NavTabsProps<T> {
  /**
   * `false` quando nenhuma aba está selecionada — é como o MUI representa
   * isso, e serve para telas onde a seleção pode estar fora desta régua.
   */
  value: T | false;
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
          label={
            option.contagem === undefined ? (
              option.label
            ) : (
              <Box
                component="span"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
              >
                {option.label}
                <Box
                  component="span"
                  sx={{
                    minWidth: 22,
                    px: 0.75,
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: '20px',
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                    // na aba ativa, a cor da primária (a do módulo aberto)
                    ...(option.value === value
                      ? {
                          color: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.14),
                        }
                      : {
                          color: theme.palette.text.secondary,
                          bgcolor: alpha(theme.palette.text.primary, 0.07),
                        }),
                  }}
                >
                  {option.contagem}
                </Box>
              </Box>
            )
          }
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
