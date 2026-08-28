import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { Input } from '../../../components/input';
import { formatCPF, removeMask } from '../../../utils';
import {
  FORGOT_PASSWORD_SCHEMA,
  NEW_PASSWORD_SCHEMA,
  RESET_CODE_SCHEMA,
} from '../../../features/login/constants';
import {
  ForgotPasswordFormType,
  NewPasswordFormType,
  ResetCodeFormType,
} from '../../../features/login/types';
import { usePostForgotPassword } from '../../../features/login/api/postForgotPassword';
import { usePostVerifyResetCode } from '../../../features/login/api/postVerifyResetCode';
import { usePostResetPassword } from '../../../features/login/api/postResetPassword';
import Logo from '../../../assets/logo-ic.svg?react';

/** Espelha o cooldown do backend: novo código só depois de 60s. */
const RESEND_COOLDOWN_SECONDS = 60;

enum Etapa {
  CPF,
  CODIGO,
  SENHA,
}

const TEXTOS = {
  [Etapa.CPF]: {
    titulo: 'Esqueceu sua senha?',
    subtitulo:
      'Informe o CPF do seu cadastro. Enviaremos um código de 8 dígitos para o e-mail cadastrado.',
  },
  [Etapa.CODIGO]: {
    titulo: 'Digite o código',
    subtitulo:
      'Confira sua caixa de entrada — e o spam. O código vale por 1 hora.',
  },
  [Etapa.SENHA]: {
    titulo: 'Crie a nova senha',
    subtitulo: 'Use pelo menos 8 caracteres. Guarde-a em um lugar seguro.',
  },
};

function ForgotPassword() {
  const navigate = useNavigate();
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';

  const [etapa, setEtapa] = useState<Etapa>(Etapa.CPF);
  /** CPF sem máscara, guardado para as etapas seguintes. */
  const [documento, setDocumento] = useState('');
  /** Credencial de uso único devolvida quando o código confere. */
  const [ticket, setTicket] = useState('');
  const [segundosParaReenviar, setSegundosParaReenviar] = useState(0);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const formCpf = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(FORGOT_PASSWORD_SCHEMA),
    defaultValues: { cpf: '' },
  });
  const formCodigo = useForm<ResetCodeFormType>({
    resolver: zodResolver(RESET_CODE_SCHEMA),
    defaultValues: { code: '' },
  });
  const formSenha = useForm<NewPasswordFormType>({
    resolver: zodResolver(NEW_PASSWORD_SCHEMA),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (segundosParaReenviar <= 0) return;

    const id = setTimeout(
      () => setSegundosParaReenviar(segundosParaReenviar - 1),
      1000
    );

    return () => clearTimeout(id);
  }, [segundosParaReenviar]);

  const { mutate: solicitarCodigo, isLoading: enviando } =
    usePostForgotPassword({
      onSuccess: () => {
        setEtapa(Etapa.CODIGO);
        setSegundosParaReenviar(RESEND_COOLDOWN_SECONDS);
      },
    });

  const { mutate: validarCodigo, isLoading: validando } = usePostVerifyResetCode(
    {
      onSuccess: (response) => {
        setTicket(response.ticket);
        setEtapa(Etapa.SENHA);
      },
    }
  );

  const { mutate: redefinirSenha, isLoading: salvando } = usePostResetPassword({
    onSuccess: () => {
      Swal.fire({
        title: 'Senha redefinida',
        text: 'Entre com sua nova senha.',
        icon: 'success',
        confirmButtonText: 'Ir para o login',
      }).then(() => navigate('/login'));
    },
    onError: (error: any) => {
      // 401 aqui é ticket vencido ou já usado: não adianta tentar de novo com a
      // mesma credencial, o caminho é pedir um código novo.
      if (error?.response?.status === 401) {
        setTicket('');
        formCodigo.reset();
        setEtapa(Etapa.CPF);
      }
    },
  });

  function onSubmitCpf(data: ForgotPasswordFormType) {
    const cpfLimpo = removeMask(data.cpf);

    setDocumento(cpfLimpo);
    solicitarCodigo({ document: cpfLimpo });
  }

  function onSubmitCodigo(data: ResetCodeFormType) {
    validarCodigo({ document: documento, code: data.code });
  }

  function onSubmitSenha(data: NewPasswordFormType) {
    redefinirSenha({ ticket, password: data.password });
  }

  function voltar() {
    if (etapa === Etapa.CPF) {
      navigate('/login');
      return;
    }

    // Da tela de senha para trás o ticket não serve mais: o usuário refaz a
    // validação do código.
    setTicket('');
    setEtapa(etapa === Etapa.SENHA ? Etapa.CODIGO : Etapa.CPF);
  }

  const styles = {
    raiz: {
      minHeight: '100vh',
      '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.default',
      px: { xs: 2.5, sm: 4 },
      py: { xs: 4, sm: 6 },
    },
    cartao: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: 'background.paperSecondary',
      borderRadius: 4,
      p: { xs: 3, sm: 4 },
      boxShadow: escuro
        ? `0 24px 50px ${alpha('#000000', 0.5)}`
        : `0 24px 50px ${alpha('#1C0F4D', 0.14)}`,
    },
    marca: {
      width: 40,
      height: 'auto',
      mb: 2,
    },
    logo: {
      width: '100%',
      height: '100%',
      fill: theme.palette.primary.main,
    },
    titulo: {
      fontWeight: 600,
      fontSize: { xs: '1.5rem', md: '1.75rem' },
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
    },
    subtitulo: {
      color: 'text.secondary',
      fontSize: '0.875rem',
      lineHeight: 1.6,
      mt: 1,
    },
    /** Passo atual em texto: três etapas não pedem um stepper inteiro. */
    passo: {
      color: 'text.secondary',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
    },
    campoCodigo: {
      // o `sx` do Input é substituído pelo que chega por props, então a
      // largura tem que vir junto
      width: '100%',
      '& input': {
        fontSize: '1.5rem',
        letterSpacing: '10px',
        textAlign: 'center',
        fontWeight: 600,
      },
    },
    acao: {
      height: 46,
      mt: 3,
      fontSize: '0.9375rem',
      fontWeight: 600,
    },
    textoRodape: {
      textTransform: 'none',
      fontWeight: 600,
      minWidth: 'auto',
      px: 0.75,
    },
  };

  const carregando = enviando || validando || salvando;

  return (
    <Box sx={styles.raiz}>
      <Box sx={styles.cartao}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <IconButton onClick={voltar} size="small" aria-label="Voltar">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Typography sx={styles.passo}>
            Etapa {etapa + 1} de 3
          </Typography>
        </Stack>

        <Box sx={styles.marca}>
          <Logo style={styles.logo} />
        </Box>

        <Typography component="h1" sx={styles.titulo}>
          {TEXTOS[etapa].titulo}
        </Typography>
        <Typography sx={styles.subtitulo}>{TEXTOS[etapa].subtitulo}</Typography>

        {etapa === Etapa.CPF && (
          <form onSubmit={formCpf.handleSubmit(onSubmitCpf)}>
            <Box mt={3}>
              <Controller
                name="cpf"
                control={formCpf.control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    autoFocus
                    label="CPF"
                    value={value}
                    error={!!formCpf.formState.errors.cpf}
                    errorMessage={formCpf.formState.errors.cpf?.message}
                    onChange={(event) => onChange(formatCPF(event.target.value))}
                  />
                )}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={styles.acao}
              disabled={carregando}
            >
              {enviando ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Enviar código'
              )}
            </Button>
          </form>
        )}

        {etapa === Etapa.CODIGO && (
          <form onSubmit={formCodigo.handleSubmit(onSubmitCodigo)}>
            <Box mt={3}>
              <Controller
                name="code"
                control={formCodigo.control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    autoFocus
                    label="Código de 8 dígitos"
                    value={value}
                    sx={styles.campoCodigo}
                    error={!!formCodigo.formState.errors.code}
                    errorMessage={formCodigo.formState.errors.code?.message}
                    inputProps={{ inputMode: 'numeric', maxLength: 8 }}
                    onChange={(event) =>
                      onChange(event.target.value.replace(/\D/g, ''))
                    }
                  />
                )}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={styles.acao}
              disabled={carregando}
            >
              {validando ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Validar código'
              )}
            </Button>

            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="center"
              alignItems="center"
              mt={2}
            >
              <Typography variant="body2" color="text.secondary">
                Não recebeu?
              </Typography>
              <Button
                variant="text"
                sx={styles.textoRodape}
                disabled={segundosParaReenviar > 0 || carregando}
                onClick={() => solicitarCodigo({ document: documento })}
              >
                {segundosParaReenviar > 0
                  ? `Reenviar em ${segundosParaReenviar}s`
                  : 'Reenviar código'}
              </Button>
            </Stack>
          </form>
        )}

        {etapa === Etapa.SENHA && (
          <form onSubmit={formSenha.handleSubmit(onSubmitSenha)}>
            <Stack spacing={2} mt={3}>
              <Controller
                name="password"
                control={formSenha.control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    autoFocus
                    label="Nova senha"
                    autoComplete="new-password"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={value}
                    error={!!formSenha.formState.errors.password}
                    errorMessage={formSenha.formState.errors.password?.message}
                    onChange={onChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Mostrar ou esconder a senha"
                            onClick={() => setMostrarSenha((atual) => !atual)}
                            onMouseDown={(event) => event.preventDefault()}
                          >
                            {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={formSenha.control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Digite a senha novamente"
                    autoComplete="new-password"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={value}
                    error={!!formSenha.formState.errors.confirmPassword}
                    errorMessage={
                      formSenha.formState.errors.confirmPassword?.message
                    }
                    onChange={onChange}
                  />
                )}
              />
            </Stack>

            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={styles.acao}
              disabled={carregando}
            >
              {salvando ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>
        )}

        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
          mt={2}
        >
          <Typography variant="body2" color="text.secondary">
            Lembrou a senha?
          </Typography>
          <Button
            variant="text"
            sx={styles.textoRodape}
            onClick={() => navigate('/login')}
          >
            Entrar
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export { ForgotPassword };
