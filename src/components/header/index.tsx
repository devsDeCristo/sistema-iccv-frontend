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
      // no celular a ação desce para baixo do título: lado a lado, um nome
      // comprido espremia o botão e estourava a linha
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'start' },
      justifyContent: 'space-between',
      gap: 1.5,
      mb: 2,
    },
    boxInner: {
      gap: 2,
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
    },
    boxColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    },
    title: {
      lineHeight: 1.2,
      fontSize: { xs: 20, sm: 24 },
      color: theme.palette.text.primary,
      fontWeight: 500,
      wordBreak: 'break-word',
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
