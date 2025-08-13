import { ArrowBack } from '@mui/icons-material';
import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  buttonBack?: boolean;
  pageBack?: string;
  description?: string;
  children?: React.ReactNode;
}

function Header({
  title,
  buttonBack = false,
  pageBack,
  description,
  children,
}: HeaderProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  function GoPage() {
    if (pageBack) {
      navigate(pageBack);
    } else navigate(-1);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mb: 2,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {buttonBack && (
          <IconButton onClick={GoPage} size="small">
            <ArrowBack color="primary" />
          </IconButton>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Typography
            fontSize={22}
            color={theme.palette.text.primary}
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography fontSize={16} color={theme.palette.text.primary}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {children}
      </Box>
      {/* <Divider color={theme.palette.text.primary} sx={{ marginY: 2 }} /> */}
    </Box>
  );
}

export { Header };
