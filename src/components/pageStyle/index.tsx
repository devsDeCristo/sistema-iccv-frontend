import { Box, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
}

function PageStyle({ children }: PageProps) {
  const theme = useTheme();
  return (
    <Box
      padding={5}
      width="100%"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      {children}
    </Box>
  );
}

export { PageStyle };
