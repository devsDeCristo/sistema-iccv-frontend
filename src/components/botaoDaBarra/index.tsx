import {
  Box,
  Button,
  ButtonProps,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';

/**
 * Botão das barras de busca e ações (abas do evento): com texto na tela
 * grande e **só o ícone** no celular, onde quatro botões de texto empilhados
 * ocupavam meia tela. No celular o texto vira dica e `aria-label`, para o
 * leitor de tela continuar dizendo o que o botão faz.
 *
 * O texto vai em `children`, e só texto: é ele que vira o rótulo.
 */
function BotaoDaBarra({
  children,
  sx,
  ...props
}: Omit<ButtonProps, 'children'> & { children: string }) {
  const theme = useTheme();
  const celular = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Tooltip title={celular ? children : ''}>
      <Button
        aria-label={children}
        sx={[
          {
            flexShrink: 0,
            minWidth: { xs: 0, sm: 64 },
            px: { xs: 1.25, sm: 2 },
            // sem o texto, o ícone fica sozinho e centrado
            // a partir do `sm`, a margem padrão do MUI (8px à direita, -4px
            // à esquerda): um `xs` sozinho valeria para todos os tamanhos
            '& .MuiButton-startIcon': {
              mr: { xs: 0, sm: 1 },
              ml: { xs: 0, sm: -0.5 },
            },
            '& .MuiButton-endIcon': { display: { xs: 'none', sm: 'inherit' } },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {children}
        </Box>
      </Button>
    </Tooltip>
  );
}

export { BotaoDaBarra };
