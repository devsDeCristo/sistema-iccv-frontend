import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
}

function PageStyle({ children }: PageProps) {
  return (
    <Box padding={5} width="100%">
      {children}
    </Box>
  );
}

export { PageStyle };
