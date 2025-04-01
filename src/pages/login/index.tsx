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
import axios from 'axios';
function Login() {
  const navigate = useNavigate();
  const url=  import.meta.env.REACT_APP_API_URL;
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
    handleLoginApi(data);
    // mutatePostLoginEvent({
    //   data,
    // });
  }

  // const handleLogin = () => {
  //   localStorage.setItem(data.cpf, data.password);
  //   navigate('/eventos');
  // };


  const handleLoginApi = async (data: LoginFormType) => {
    const { cpf, password } = data;
    if (!cpf || !password) {
      
      return;
    }

    // setLoading(true);
    try {
      const response = await axios.post(
        `${url}/auth/login`,
        { documnet:cpf, password },
        { withCredentials: false }
      );

      if (response?.data?.acccess_token) {
        localStorage.setItem('access_token', response.data.acccess_token);
     //   navigate("/eventos");
      
      }
    } catch (error) {
      console.error(error);
    } finally {
      // setLoading(false);
    }
  };

  const styles={boxContainer:{
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  paperBlue:{
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
  },
  paper:{
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
  },
  stackIcon:{ padding: '0px', width: '100%' },
  icon:{ height: 'auto', width: 'auto' },
  img:{ height: 'auto', width: '5vw', minWidth: '80px' },
  boxInputs:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'left',
    marginTop: '20px',
    gap: 2,
  }
  }
  return (
    <>
      {/* <Header title="Login" /> */}
      <Box
        sx={styles.boxContainer}
      >
        <Paper
          sx={styles.paperBlue}
        />
        <Paper
          sx={styles.paper}
        >
          <Stack
            direction={'column'}
            gap={'15px'}
            alignItems={'center'}
            sx={styles.stackIcon}
          >
            <Icon style={styles.icon}>
              <img
                src={logo}
                style={styles.img}
                alt="logo iccv"
              />
            </Icon>

            <Box
              sx={styles.boxInputs}
            >
              <Typography variant="h5">Acesso administrativo</Typography>
              <Typography>Faça login com seu CPF</Typography>
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
