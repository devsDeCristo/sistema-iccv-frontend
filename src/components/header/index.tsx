import { ArrowBack } from '@mui/icons-material';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
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
  const style = {
    boxContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'start',
      justifyContent: 'space-between',
      mb: 2,
    },
    boxInner: {
      gap: 2,
      display: 'flex',
      alignItems: 'center',
    },
    boxColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    title: {
      lineHeight: 1.2,
      fontSize: 24,
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
    description: {
      fontSize: 16,
      color: theme.palette.text.secondary,
    },
  };

  return (
    <Box sx={style.boxContainer}>
      <Box sx={style.boxInner}>
        {buttonBack && (
          <IconButton onClick={GoPage} size="small">
            <ArrowBack
              sx={{
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.text.primary
                    : theme.palette.primary.main,
              }}
            />
          </IconButton>
        )}
        <Box sx={style.boxColumn}>
          <Typography sx={style.title}>{title}</Typography>
          {description ? (
            <Typography sx={style.description}>{description}</Typography>
          ) : null}
        </Box>
      </Box>
      {children}
      {/* <Divider color={theme.palette.text.primary} sx={{ marginY: 2 }} /> */}
    </Box>
  );
}

export { Header };
