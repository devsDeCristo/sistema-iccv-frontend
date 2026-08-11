import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { FormProvider, useForm } from 'react-hook-form';
import { LOGIN_SCHEMA } from '../../features/login/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormLogin } from '../../features/login/components/form';
import { useEffect } from 'react';
// import { setBearerToken } from '../../config/lib/axios/api-client';
import { usePermission } from '../../hooks/usePermission';
import { usePostLogin } from '../../features/login/api/postLogin';
import Swal from 'sweetalert2';
import { useRole } from '../../hooks/useRole';
import { ADMIN_AREA_ROLES } from '../../constants/roles';
import { LoginFormType } from '../../features/login/types';
//images
import CapaLogin from '../../assets/capaLogin2.jpg';
import Logo from '../../assets/logo-ic.svg?react';

function Login() {
  const navigate = useNavigate();
  const theme = useTheme();

  const methods = useForm<LoginFormType>({
    resolver: zodResolver(LOGIN_SCHEMA),
  });

  function onSubmitForm(data: LoginFormType) {
    const { cpf, password } = data;
    const cleanedCpf = cpf.replace(/[.\-\s]/g, '');

    mutatePostLogin({ document: cleanedCpf, password });
  }

  useEffect(() => {
    const permission = usePermission();
    const { canAccessAdminArea } = useRole();

    if (!permission) return;

    // os dois ifs eram independentes, então o segundo sempre vencia
    // e mandava o admin para a área de usuário
    navigate(canAccessAdminArea ? '/admin/eventos' : '/eventos');
  }, []);

  const { mutate: mutatePostLogin, isLoading } = usePostLogin({
    onSuccess: (response) => {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      if (ADMIN_AREA_ROLES.includes(response.user.role)) {
        navigate('/admin/eventos');
      } else {
        navigate('/eventos');
      }
    },
    onError: (error: any) => {
      if (error.response.status === 404) {
        localStorage.setItem('cpf', JSON.parse(error.config.data).document);
        navigate('/usuario/cadastrar');
        Swal.fire({
          title: 'Atenção',
          text: 'Você não possui cadastro ainda, se cadastre para se inscrever no cursilho',
          icon: 'info',
          confirmButtonText: 'Ok',
        });
      }
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
    paperImg: {
      padding: 10,
      position: 'relative',
      backgroundImage: `url(${CapaLogin})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      borderRadius: '0px!important',
      width: '60vw',
      height: '100vh',
      minWidth: '300px',
      minHeight: '500px',
      display: { xs: 'none', md: 'flex' },
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      '&:after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(2, 29, 70, 0.3)' /* tom de azul */,
        mixBlendMode: 'multiply' /* mistura com a imagem */,
      },
      //padding: '40px 80px',
    },
    paper: {
      position: 'relative',
      inHeight: '500px',
      width: { xs: '100vw', md: '40vw' },
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      display: 'flex',
      minWidth: '340px',
    },
    title: { fontWeight: 400, fontSize: { xs: '2rem', md: '2.5rem' } },
    subtitle: { fontWeight: 400, fontSize: { xs: '0.875rem', md: '1rem' } },
    stackIcon: { padding: '0px', width: '100%' },
    icon: { height: '100%', width: '100%', fill: theme.palette.primary.main },
    boxIcon: { height: 'auto', width: { xs: '50px', md: '60px' }, mt: { xs: '-30px', md: '0px' } },
    img: { height: 'auto', width: '5vw', minWidth: '80px' },
    boxInputs: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'left',
      marginTop: '20px',
      width: { xs: '80%', xm: '70%' },
      //  minWidth: '310px',
      gap: { xs: 3, md: 5 },
    },
    titleBanner: {
      color: 'white',
      position: 'relative',
      zIndex: 2,
      fontSize: '2.5rem',
      fontWeight: 600,
      textAlign: 'center',
    },
    subTitleBanner: {
      color: 'white',
      position: 'relative',
      zIndex: 2,
      fontWeight: 500,
      fontSize: '1.2rem',
      textAlign: 'center',
    },
    copyright: {
      color: theme.palette.text.primary,
      position: 'absolute',
      fontSize: { xs: '0.75rem', md: '0.875rem' },
      zIndex: 2,
      fontWeight: 400,
      textAlign: 'center',
      width: '100%',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  };
  const handleButton = () => {
    navigate('/usuario/cadastrar');
  };

  return (
    <Stack direction="row-reverse" width="100vw" height="100vh">
      <Paper sx={styles.paper}>
        <Box sx={styles.boxIcon}>
          <Logo style={styles.icon} />
        </Box>

        <Box sx={styles.boxInputs}>
          <Box>
            <Typography sx={styles.title}>Login</Typography>
            <Typography sx={styles.subtitle}>
              Bem-vindo! Faça login para acessar sua conta.
            </Typography>
          </Box>

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
        <Typography sx={styles.copyright}>
          © 2025 Igreja de Cristo Cidade Verde.
          <br /> Todos os direitos reservados.
        </Typography>
      </Paper>
      <Paper sx={styles.paperImg}>
        <Typography sx={styles.titleBanner}>
          Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não
          para os homens.
        </Typography>
        <Typography sx={styles.subTitleBanner}>(Colossenses 3:23)</Typography>
      </Paper>
    </Stack>
  );
}

export { Login };
