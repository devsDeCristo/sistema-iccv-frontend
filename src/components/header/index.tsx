import { ArrowBack } from '@mui/icons-material';
import { Box, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  buttonBack?: boolean;
  pageBack?: string;
}

function Header({ title, buttonBack = false, pageBack }: HeaderProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  function GoPage() {
    if (pageBack) {
      navigate(pageBack);
    } else navigate(-1);
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {buttonBack && (
          <IconButton onClick={GoPage}>
            <ArrowBack color="primary" />
          </IconButton>
        )}
        <Typography fontSize={22} color={theme.palette.text.primary}>
          {title}
        </Typography>
      </Box>
      <Divider color={theme.palette.text.primary} sx={{ marginY: 2 }} />
    </>
  );
}

export { Header };
