import {
  Box,
  Button,
  CircularProgress,
  Icon,
  Paper,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/ic-logo.png';
import { FormProvider, useForm } from 'react-hook-form';
import { LoginFormType } from '../../types/login';
import { LOGIN_SCHEMA } from '../../features/users/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLogin } from '../../features/login/components/form';
import { useEffect } from 'react';
// import { setBearerToken } from '../../config/lib/axios/api-client';
import { usePermission } from '../../hooks/usePermission';
import { usePostLogin } from '../../features/login/api/postLogin';
import Swal from 'sweetalert2';
import { useRole } from '../../hooks/useRole';

function Login() {
  const navigate = useNavigate();

  const methods = useForm<LoginFormType>({
    resolver: zodResolver(LOGIN_SCHEMA),
  });

  function onSubmitForm(data: LoginFormType) {
    //handleLoginApi(data);
    const { cpf } = data;
    const cleanedCpf = cpf.replace(/[.\-\s]/g, '');
    mutatePostLogin({ document: cleanedCpf, password: 'password123' });
  }

  useEffect(() => {
    const permission = usePermission();
    const role = useRole();
    if (permission && role) {
      navigate('/eventos');
    }
    if (permission) {
      navigate('/cadastrar-cursilho');
    }
  }, []);

  const { mutate: mutatePostLogin, isLoading } = usePostLogin({
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      if (response.user.role === 1) {
        navigate('/eventos');
      } else {
        navigate('/cadastrar-cursilho');
      }
    },
    onError: (error: any) => {
      if (error.response.status === 401) {
        navigate('/user/register');
      }
      Swal.fire({
        title: 'Atenção',
        text: 'Você não possui cadastro ainda, se cadastre para se inscrever no cursilho',
        icon: 'info',
        confirmButtonText: 'Ok',
      });
    },
  });

  const styles = {
    boxContainer: {
      width: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      // minWidth: '310px',
    },
    paperBlue: {
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
      //padding: '40px 80px',
    },
    paper: {
      inHeight: '500px',
      //minWidth: '310px',
      // padding: '40px 80px',
      //paddingX: { xs: '40px', md: '80px' },
      //width: '40vw',
      width: '100vw',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      display: 'flex',
      minWidth: '340px',
    },
    title: { fontWeigth: 900, fontSize: '1.2rem' },
    stackIcon: { padding: '0px', width: '100%' },
    icon: { height: 'auto', width: 'auto' },
    img: { height: 'auto', width: '5vw', minWidth: '80px' },
    boxInputs: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'left',
      marginTop: '20px',
      width: { xs: '80%', xm: '320px' },
      //  minWidth: '310px',
      gap: 2,
    },
  };
  const handleButton = () => {
    navigate('/user/register');
  };
  {
    /* <Box sx={styles.boxContainer}>
      <Paper sx={styles.paperBlue} /> */
  }
  return (
    <Paper sx={styles.paper}>
      <Icon style={styles.icon}>
        <img src={logo} style={styles.img} alt="logo iccv" />
      </Icon>

      <Box sx={styles.boxInputs}>
        <Typography sx={styles.title}>Seja bem-vindo</Typography>
        <Typography>Insira seu CPF</Typography>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmitForm)}>
            <FormLogin />

            <Button
              variant="contained"
              //color="secondary"
              fullWidth
              sx={{
                height: '40px',
                marginTop: 2,
              }}
              type="submit"
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </FormProvider>
        <Button variant="text" onClick={handleButton}>
          Não possui cadastro? Clique aqui
        </Button>
      </Box>
    </Paper>
  );
}

export { Login };
