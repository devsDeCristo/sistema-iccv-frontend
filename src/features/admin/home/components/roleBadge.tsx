import { ReactNode } from 'react';
import {
  alpha,
  Badge,
  Box,
  SvgIcon,
  Theme,
  Tooltip,
  useTheme,
} from '@mui/material';
import { AttachMoney, Code } from '@mui/icons-material';
import { ROLE_LABELS, Role } from '../../../../constants/roles';
import { VIOLETA_VIVO } from '../../../../themes';

/**
 * Coroa.
 *
 * Desenhada aqui porque o `@mui/icons-material` não tem uma: os candidatos
 * (`WorkspacePremium`, `MilitaryTech`) são selos com fita, cheios de detalhe
 * que vira borrão nos 13px deste selo. Três pontas e uma base leem bem em
 * qualquer tamanho.
 */
function Coroa(props: { sx?: object }) {
  return (
    <SvgIcon viewBox="0 0 24 24" {...props}>
      <path d="M4 18h16v2H4z" />
      <path d="M4 16 2 7l5.5 4L12 4l4.5 7L22 7l-2 9z" />
    </SvgIcon>
  );
}

/** Como cada perfil se apresenta no canto do avatar. */
function selo(role: number, theme: Theme) {
  const escuro = theme.palette.mode === 'dark';

  if (role === Role.DEV) {
    return { icone: <Code />, cor: escuro ? '#A78BFA' : VIOLETA_VIVO };
  }

  if (role === Role.FINANCE) {
    return { icone: <AttachMoney />, cor: theme.palette.chips.success };
  }

  if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
    return { icone: <Coroa />, cor: escuro ? '#FBBF24' : '#D97706' };
  }

  return null;
}

interface RoleBadgeProps {
  role?: number | null;
  children: ReactNode;
}

/**
 * Marca o perfil no canto do avatar.
 *
 * É reforço, não o único sinal: a frase ao lado já diz o cargo por extenso, e
 * quem não distingue o desenho continua lendo quem é. Por isso o selo pode ser
 * pequeno — ele serve para reconhecer de relance, não para informar.
 */
export function RoleBadge({ role, children }: RoleBadgeProps) {
  const theme = useTheme();

  const marca = role === null || role === undefined ? null : selo(role, theme);
  if (!marca) return <>{children}</>;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <Tooltip title={ROLE_LABELS[role as number] ?? ''}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 21,
              height: 21,
              borderRadius: '50%',
              bgcolor: marca.cor,
              color: theme.palette.common.white,
              /**
               * O aro na cor do papel separa o selo da foto por baixo. Sem
               * ele, foto clara e selo claro encostam e viram uma mancha só.
               */
              boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 1px 3px ${alpha(
                '#000',
                0.35
              )}`,
              '& svg': { fontSize: 13 },
            }}
          >
            {marca.icone}
          </Box>
        </Tooltip>
      }
    >
      {children}
    </Badge>
  );
}
