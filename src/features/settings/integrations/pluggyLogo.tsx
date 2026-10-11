import { Box, SxProps, Theme } from '@mui/material';

import Logo from '../../../assets/integracoes/pluggy.svg?react';

/**
 * A marca da Pluggy, no mesmo molde das marcas de gateway (`ProviderLogo`):
 * quadrada, com o fundo no desenho. É uma reconstrução pela cor e pela
 * inicial, não o arquivo oficial — trocar é substituir o `.svg`.
 */
function PluggyLogo({ size = 40, sx }: { size?: number; sx?: SxProps<Theme> }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        lineHeight: 0,
        borderRadius: `${size * (11 / 48)}px`,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
        '& svg': { width: '100%', height: '100%', display: 'block' },
        ...sx,
      }}
    >
      <Logo />
    </Box>
  );
}

export { PluggyLogo };
