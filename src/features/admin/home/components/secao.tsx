import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface SecaoDaHomeProps {
  titulo: string;
  /** Botão do canto direito — normalmente o caminho para a tela cheia */
  acao?: ReactNode;
  children: ReactNode;
}

/**
 * Cabeçalho das seções da home.
 *
 * O rótulo segue a tipografia dos cabeçalhos de tabela e da régua lateral
 * (11px, caixa alta, espaçada): a home tem três ou quatro blocos empilhados, e
 * títulos grandes competiriam com os números, que são o conteúdo da tela.
 */
export function SecaoDaHome({ titulo, acao, children }: SecaoDaHomeProps) {
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        sx={{ mb: 1.25, minHeight: 32 }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {titulo}
        </Typography>

        {acao}
      </Stack>

      {children}
    </Box>
  );
}
