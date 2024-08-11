import {
  Box,
  Button,
  Icon,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
//import background from '../../assets/login-logo.png';
import logo from '../../assets/ic-logo.png';
import { useEffect } from 'react';
import { usePermission } from '../../hooks/usePermission';
function Login() {
  const navigate = useNavigate();
  const permission = usePermission();
  useEffect(() => {
    if (permission) {
      console.log('madas');

      navigate('/eventos');
    }
  }, [permission]);
  return (
    <>
      {/* <Header title="Login" /> */}
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Paper
          sx={{
            //backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            borderRadius: '0px!important',
            width: '60vw',
            height: '100vh',
            minWidth: '300px',
            minHeight: '500px',
            //    display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: '#28166F',
          }}
        />
        <Paper
          sx={{
            minHeight: '500px',
            minWidth: '310px',
            padding: '40px 80px',
            width: { xs: '100vw', md: '40vw' },
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            display: 'flex',
          }}
        >
          <Stack
            direction={'column'}
            gap={'15px'}
            alignItems={'center'}
            sx={{ padding: '0px', width: '100%' }}
          >
            <Icon style={{ height: 'auto', width: 'auto' }}>
              <img
                src={logo}
                style={{ height: 'auto', width: '15vw' }}
                alt="logo iccv"
              />
            </Icon>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'left',
                marginTop: '20px',
                gap: 2,
              }}
            >
              {' '}
              <Typography variant="h5">Acesso administrativo</Typography>
              <Typography>Faça login em sua conta</Typography>
              <TextField label="Login" value={''} onChange={() => {}} />
              <TextField label="Senha" value={''} onChange={() => {}} />
              <Button
                variant="contained"
                sx={{
                  height: '40px',
                }}
                onClick={() => {
                  localStorage.setItem('user', 'iccv');
                  navigate('/eventos');
                }}
              >
                Entrar
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

export { Login };
