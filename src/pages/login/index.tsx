import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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

/**
 * O índigo da marca veste a foto nos dois temas. No modo escuro o
 * `primary.main` é um azul claro (#2563EB) que, esticado por cima da imagem,
 * lavaria a fotografia: aqui a cor é acabamento de imagem, não superfície de
 * interface, então fica fixa.
 */
const TINTA = '#1C0F4D';

function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';

  /**
   * Duas camadas: uma luz morna caindo de cima, como sol de fim de tarde
   * entrando por uma janela, e o índigo da marca adensando até o rodapé — é ele
   * que dá cama para o texto claro sem precisar de caixa nem sombra pesada.
   *
   * No celular a foto é o fundo da página inteira e este véu vem junto dela, na
   * própria raiz; no desktop ele veste só a coluna da imagem.
   */
  const veuDesktop = `radial-gradient(120% 78% at 50% 0%, ${alpha(
    '#FFD8A8',
    0.22
  )} 0%, transparent 62%), linear-gradient(180deg, ${alpha(
    TINTA,
    0.32
  )} 0%, ${alpha(TINTA, 0.58)} 44%, ${alpha(TINTA, 0.88)} 100%)`;

  /**
   * No celular o mesmo degradê cobre a página inteira, e o versículo cai na
   * faixa de cima — a mais clara da foto. Aqui ele começa mais fechado para o
   * texto branco não disputar com o miolo iluminado da imagem.
   */
  const veuMobile = `radial-gradient(120% 70% at 50% 0%, ${alpha(
    '#FFD8A8',
    0.18
  )} 0%, transparent 58%), linear-gradient(180deg, ${alpha(
    TINTA,
    0.5
  )} 0%, ${alpha(TINTA, 0.66)} 42%, ${alpha(TINTA, 0.92)} 100%)`;

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
        navigate('/home');
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
    raiz: {
      minHeight: '100vh',
      // no celular a barra do navegador come parte da 100vh e corta o rodapé
      '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: { xs: 'center', md: 'flex-start' },
      backgroundColor: 'background.default',
      // o gradiente vem antes da foto: ele é a camada de cima
      backgroundImage: { xs: `${veuMobile}, url(${CapaLogin})`, md: 'none' },
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    banner: {
      position: 'relative',
      flex: { md: '1 1 56%' },
      // no celular não é bloco de imagem, e sim o versículo sobre o fundo da
      // página; a foto e o véu ficam na raiz
      backgroundImage: { xs: 'none', md: `url(${CapaLogin})` },
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: { xs: 3, sm: 5, md: 8 },
      pt: { xs: 4, sm: 7, md: 8 },
      pb: { xs: 1, md: 8 },
      overflow: 'hidden',
    },
    veu: {
      display: { xs: 'none', md: 'block' },
      position: 'absolute',
      inset: 0,
      background: veuDesktop,
    },
    conteudoBanner: {
      position: 'relative',
      zIndex: 1,
      maxWidth: 560,
      alignItems: 'center',
      textAlign: 'center',
    },
    /** Cruz fina de um pixel: o sinal religioso sem virar ilustração. */
    cruz: {
      position: 'relative',
      width: '1px',
      height: { xs: 32, md: 44 },
      backgroundColor: alpha('#FFFFFF', 0.65),
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 14,
        left: '-9px',
        width: 19,
        height: '1px',
        backgroundColor: alpha('#FFFFFF', 0.65),
      },
    },
    versiculo: {
      color: '#FFFFFF',
      // sem itálico de propósito: o index.css tem `font-synthesis: none` e o
      // Roboto itálico não é carregado, então `fontStyle` não faria nada aqui.
      // O peso 300 com as aspas curvas já dá o tom de citação.
      fontWeight: 300,
      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.7rem', lg: '1.9rem' },
      lineHeight: 1.55,
      letterSpacing: '0.2px',
      textShadow: `0 2px 20px ${alpha('#000000', 0.35)}`,
    },
    referencia: {
      color: alpha('#FFFFFF', 0.78),
      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
      fontWeight: 500,
      letterSpacing: '2.5px',
      textTransform: 'uppercase',

    },
    ladoForm: {
      flex: { md: '0 0 44%' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: { xs: 2.5, sm: 4, md: 5 },
      py: { xs: 2, md: 6 },
    },
    coluna: {
      width: '100%',
      maxWidth: 420,
    },
    /**
     * No celular o formulário flutua sobre a foto, então precisa de superfície
     * própria para o texto escuro ter contraste. No desktop a coluna já tem o
     * fundo da página inteira para si e o cartão só somaria moldura.
     */
    superficie: {
      backgroundColor: { xs: 'background.paperSecondary', md: 'transparent' },
      borderRadius: { xs: 4, md: 0 },
      p: { xs: 2.5, sm: 3, md: 0 },
      boxShadow: {
        xs: escuro
          ? `0 24px 50px ${alpha('#000000', 0.5)}`
          : `0 24px 50px ${alpha(TINTA, 0.28)}`,
        md: 'none',
      },
    },
    marca: {
      width: { xs: 35, md: 45 },
      height: 'auto',
      mx: 'auto',
      mb: { xs: 1.5, md: 2 },
    },
    logo: {
      width: '100%',
      height: '100%',
      fill: theme.palette.primary.main,
    },
    sobrenome: {
      color: 'text.secondary',
      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
      fontWeight: 600,
      letterSpacing: '1.6px',
      textTransform: 'uppercase',
      textAlign: 'center',
      mb: { xs: 2, md: 5 },
      mt: { xs: -1, md: -1.5 },
    },
    titulo: {
      fontWeight: 600,
      fontSize: { xs: '1.75rem', md: '2.125rem' },
      letterSpacing: '-0.5px',
      lineHeight: 1.15,
    },
    subtitulo: {
      color: 'text.secondary',
      fontSize: { xs: '0.875rem', md: '0.9375rem' },
      mt: 1,
      lineHeight: 1.6,
    },
    // os campos ficam direto sobre o fundo da página, sem superfície própria
    bloco: {
      mt: { xs: 2.5, md: 3.5 },
    },
    entrar: {
      height: 46,
      mt: { xs: 2.5, md: 3 },
      fontSize: '0.9375rem',
      fontWeight: 600,
      letterSpacing: '0.2px',
    },
    rodapeForm: {
      mt: { xs: 1.5, md: 2.5 },
      justifyContent: 'center',
      alignItems: 'center',
    },
    copyright: {
      // no celular o rodapé cai sobre o pé da foto, onde o véu já está fechado
      color: { xs: alpha('#FFFFFF', 0.72), md: 'text.secondary' },
      fontSize: '0.75rem',
      textAlign: 'center',
      lineHeight: 1.7,
      mt: { xs: 2.5, md: 4 },
    },
  };

  const handleButton = () => {
    navigate('/usuario/cadastrar');
  };

  return (
    <Box sx={styles.raiz}>
      <Box sx={styles.banner}>
        <Box sx={styles.veu} />

        <Stack spacing={{ xs: 1.2, md: 3.5 }} sx={styles.conteudoBanner}>
          <Box sx={styles.cruz} />

          <Typography sx={styles.versiculo}>
            “Tudo o que fizerem, façam de todo o coração, como para o Senhor, e
            não para os homens.”
          </Typography>

          <Typography sx={styles.referencia}>Colossenses 3:23</Typography>
        </Stack>
      </Box>

      <Box sx={styles.ladoForm}>
        <Box sx={styles.coluna}>
          <Box sx={styles.superficie}>
            <Box sx={styles.marca}>
              <Logo style={styles.logo} />
            </Box>

            <Typography sx={styles.sobrenome}>
              Igreja de Cristo Cidade Verde
            </Typography>
            <Typography component="h1" sx={styles.titulo}>
              Bem-vindo de volta
            </Typography>
            <Typography sx={styles.subtitulo}>
              Entre com seu CPF para acompanhar seus eventos e inscrições.
            </Typography>

            <Box sx={styles.bloco}>
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmitForm)}>
                  <FormLogin />

                  <Button
                    variant="contained"
                    fullWidth
                    sx={styles.entrar}
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

              <Stack direction="row" spacing={0.5} sx={styles.rodapeForm}>
                <Typography variant="body2" color="text.secondary">
                  Primeira vez aqui?
                </Typography>
                <Button
                  variant="text"
                  onClick={handleButton}
                  sx={{
                    fontWeight: 600,
                    minWidth: 'auto',
                    px: 0.75,
                    // o tema capitaliza todo botão; aqui o texto continua a frase
                    textTransform: 'none',
                  }}
                >
                  Criar cadastro
                </Button>
              </Stack>
            </Box>
          </Box>

          <Typography sx={styles.copyright}>
            © 2026 Igreja de Cristo Cidade Verde.
            <br /> Todos os direitos reservados.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export { Login };
