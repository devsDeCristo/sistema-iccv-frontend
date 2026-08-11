import { useState } from 'react';
import {
  Avatar,
  AvatarProps,
  Box,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

type UserAvatarProps = Omit<AvatarProps, 'src' | 'alt'> & {
  name?: string | null;
  photoUrl?: string | null;
  /** Desativa o preview e mantém só o nome no tooltip */
  disablePreview?: boolean;
  /** Lado do preview em px */
  previewSize?: number;
};

/** "João da Silva Souza" -> "JS" */
function getInitials(name?: string | null) {
  if (!name) return '';

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return '';

  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';

  return (first + last).toUpperCase();
}

/**
 * Avatar do usuário que, ao passar o mouse, abre um preview com a foto
 * ampliada e o nome. Sem foto (ou com URL quebrada), mostra as iniciais.
 */
function UserAvatar({
  name,
  photoUrl,
  disablePreview = false,
  previewSize = 180,
  sx,
  ...avatarProps
}: UserAvatarProps) {
  const theme = useTheme();
  const [previewFailed, setPreviewFailed] = useState(false);

  const initials = getInitials(name);
  const fullName = name || 'Usuário sem nome';
  const hasPreviewImage = !!photoUrl && !previewFailed;

  const avatar = (
    <Avatar
      alt={fullName}
      // '/' preserva o comportamento atual: sem foto o Avatar cai no fallback
      src={photoUrl || '/'}
      sx={sx}
      {...avatarProps}
    >
      {initials}
    </Avatar>
  );

  if (disablePreview) {
    return (
      <Tooltip title={fullName} arrow>
        {avatar}
      </Tooltip>
    );
  }

  const preview = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 1,
      }}
    >
      {hasPreviewImage ? (
        <Box
          component="img"
          src={photoUrl as string}
          alt={fullName}
          onError={() => setPreviewFailed(true)}
          sx={{
            width: previewSize,
            height: previewSize,
            objectFit: 'cover',
            borderRadius: 1,
            display: 'block',
          }}
        />
      ) : (
        <Avatar
          sx={{
            width: previewSize,
            height: previewSize,
            borderRadius: 1,
            fontSize: previewSize / 3,
          }}
        >
          {initials}
        </Avatar>
      )}

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: previewSize,
          wordBreak: 'break-word',
        }}
      >
        {fullName}
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={preview}
      arrow
      enterDelay={350}
      leaveDelay={0}
      enterTouchDelay={0}
      componentsProps={{
        tooltip: {
          sx: {
            maxWidth: 'none',
            p: 0,
            bgcolor: theme.palette.background.paperSecondary,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[6],
          },
        },
        arrow: {
          sx: { color: theme.palette.background.paperSecondary },
        },
      }}
    >
      {avatar}
    </Tooltip>
  );
}

export { UserAvatar };
