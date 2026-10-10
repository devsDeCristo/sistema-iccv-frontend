import { Box, SxProps, Theme, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
  /** ajuste da página, por cima do padrão (ex.: menos respiro no topo) */
  sx?: SxProps<Theme>;
}

function PageStyle({ children, sx }: PageProps) {
  const theme = useTheme();
  return (
    <Box
      padding={4}
      width="100%"
      sx={[
        { backgroundColor: theme.palette.background.default },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export { PageStyle };
