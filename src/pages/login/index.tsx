import { Box, Button, Icon, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/ic-logo.png';
import { useEffect } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { FormProvider, useForm } from 'react-hook-form';
import { LoginFormType } from '../../types/login';
import { LOGIN_SCHEMA } from '../../features/users/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLogin } from '../../features/login/components/form';
function Login() {
  const navigate = useNavigate();
  const methods = useForm<LoginFormType>({
    resolver: zodResolver(LOGIN_SCHEMA),
  });
  //const usePostLogin = ({ onSuccess, ...options }) => {};
  // const { mutate: mutatePostLoginEvent } = usePostLogin({
  //   onSuccess: () => {
  //     handleLogin('/eventos');
  //   },
  // });

  useEffect(() => {
    setTimeout(() => {
      loginValidate();
    }, 200);

    async function loginValidate() {
      //const data = await checkToken();
      const permission = usePermission();

      if (!permission) {
        navigate('/login');
      } else {
        navigate('/eventos');
      }
    }
  }, [localStorage.getItem('user')]);

  function onSubmitForm(data: LoginFormType) {
    handleLogin(data);
    // mutatePostLoginEvent({
    //   data,
    // });
  }

  const handleLogin = (data: LoginFormType) => {
    localStorage.setItem(data.login, data.password);
    navigate('/eventos');
  };

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
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            alignContent: 'center',
            backgroundColor: '#28166F',
            padding: '40px 80px',
          }}
        />
        <Paper
          sx={{
            minHeight: '500px',
            minWidth: '310px',
            padding: '40px 80px',
            //width: '40vw',
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
                style={{ height: 'auto', width: '5vw', minWidth: '80px' }}
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
              <Typography variant="h5">Acesso administrativo</Typography>
              <Typography>Faça login em sua conta</Typography>
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmitForm)}>
                  <FormLogin />
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      height: '40px',
                      marginTop: 2,
                    }}
                    type="submit"
                  >
                    Entrar
                  </Button>
                </form>
              </FormProvider>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
}

export { Login };
