import { Box, Button, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  buttonBack?: boolean;
  pageBack?: string;
}

function Header({ title, buttonBack = false, pageBack }: HeaderProps) {
  const navigate = useNavigate();

  function GoPage() {
    if (pageBack) {
      navigate(pageBack);
    }

    navigate(-1);
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Typography fontSize={22} color="#000">
          {title}
        </Typography>
        {buttonBack && <Button onClick={GoPage}>Voltar</Button>}
      </Box>
      <Divider color="#000" sx={{ marginY: 2 }} />
    </>
  );
}

export { Header };
