import Swal from 'sweetalert2';
import {
  useForm,
  FormProvider,
  Controller,
  useFormContext,
} from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Checkbox,
  Grid,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Link,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';

import { Form, Section } from '../../../features/admin/users/components/form';
import { NEW_PASSWORD_SCHEMA } from '../../../features/login/constants';
import { NewPasswordFormType } from '../../../features/login/types';
import { usePermission } from '../../../hooks/usePermission';
import {
  ENUM_OPTION_LEADERSHIP_POSITION,
  REGISTER_USERS_SCHEMA,
} from '../../../features/admin/users/constants';
import { consentimentoParaEnvio } from '../../../features/admin/users/utils';
import { RegisterUsersFormType } from '../../../types/user';
import { formatCPF, removeMask } from '../../../utils';
import { usePostCreateUser } from '../../../features/admin/users/api/postUser';
import { Input } from '../../../components/input';
import Logo from '../../../assets/logo-ic.svg?react';

/**
 * O cadastro público pede a senha junto dos dados: é com ela que a pessoa
 * entra. As regras são as da redefinição de senha (8 a 72 caracteres, as duas
 * iguais) — o mesmo schema, para uma não andar diferente da outra.
 */
const CADASTRO_COM_SENHA = REGISTER_USERS_SCHEMA.and(NEW_PASSWORD_SCHEMA);
type CadastroComSenha = RegisterUsersFormType & NewPasswordFormType;

/**
 * A senha tem seção própria, fora do formulário de dados: ele é o mesmo da
 * edição e do painel, onde senha não se troca.
 */
function SecaoDaSenha() {
  const [mostrar, setMostrar] = useState(false);
  const {
    control,
    formState: { errors },
  } = useFormContext<CadastroComSenha>();

  const alternar = (
    <InputAdornment position="end">
      <IconButton
        aria-label="Mostrar ou esconder a senha"
        onClick={() => setMostrar((atual) => !atual)}
        onMouseDown={(evento) => evento.preventDefault()}
      >
        {mostrar ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Section title="Senha de acesso">
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
            Você vai entrar com o seu CPF e esta senha. Use pelo menos 8
            caracteres — uma frase curta é mais fácil de lembrar e mais difícil
            de adivinhar.
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                required
                label="Senha"
                autoComplete="new-password"
                type={mostrar ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                error={!!errors.password}
                errorMessage={errors.password?.message}
                InputProps={{ endAdornment: alternar }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                required
                label="Digite a senha novamente"
                autoComplete="new-password"
                type={mostrar ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                error={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword?.message}
              />
            )}
          />
        </Grid>
      </Section>
    </Box>
  );
}

function RegisterUser() {
  const cpfLogin = localStorage.getItem('cpf') || '';
  const DEFAULT_VALUES: CadastroComSenha = {
    fullName: '',
    // o formulário tem o campo, e sem valor inicial o input nasce não
    // controlado e troca de tipo na primeira digitada
    badgeName: '',
    cpf: formatCPF(cpfLogin) ? formatCPF(cpfLogin) : '',
    birthday: null,
    cellphone: '',
    emergencyContact: '',
    email: '',
    worker: 1,
    profession: '',
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    hypertensive: 0,
    diabetes: 0,
    sensitiveDataConsent: false,
    consentimentoOriginal: false,
    password: '',
    confirmPassword: '',
    notes: '',
    leadershipPosition: '',
    indicatedBy: '',
    religion: '',
    congregation: '',
    pastorName: '',
  };
  const navigate = useNavigate();
  const theme = useTheme();
  /**
   * O aceite dos termos é marcado pela própria pessoa — "ao se cadastrar você
   * concorda" não prova que ela aceitou. O servidor grava versão, data, IP e
   * aparelho do aceite.
   */
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [faltaAceite, setFaltaAceite] = useState(false);
  const escuro = theme.palette.mode === 'dark';

  const methods = useForm<CadastroComSenha>({
    resolver: zodResolver(CADASTRO_COM_SENHA),
    defaultValues: DEFAULT_VALUES,
  });
  const permission = usePermission();

  const { mutate: mutatePostCreateUser, isLoading } = usePostCreateUser({
    onSuccess: (response: any) => {
      methods.reset(DEFAULT_VALUES);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      Swal.fire({
        title: 'Cadastro efetuado com sucesso',
        text: 'Tudo certo! Agora você já pode se inscrever nos eventos.',
        icon: 'success',
        confirmButtonText: 'Continuar',
      }).then(() => navigate('/home'));
    },
    onError: (error: any) => {
      Swal.fire({
        title: 'Erro ao cadastrar',
        // queda de rede não traz `response`: sem o encadeamento opcional o
        // próprio tratamento de erro quebrava e a pessoa não via aviso nenhum
        text:
          error?.response?.data?.message ??
          'Não foi possível concluir o cadastro. Tente novamente em instantes.',
        icon: 'error',
      });
    },
  });

  function onSubmitForm(data: CadastroComSenha) {
    if (!aceitouTermos) {
      setFaltaAceite(true);
      toast.error('Para criar o cadastro, aceite os Termos de Uso.');
      return;
    }

    const {
      sensitiveDataConsent: _consentimento,
      consentimentoOriginal: _original,
      // a confirmação só serve à tela: vai a senha, uma vez
      confirmPassword: _confirmacao,
      ...valores
    } = data;
    const formatData = {
      ...valores,
      ...consentimentoParaEnvio(data),
      acceptedTerms: true,
      worker: !!data.worker,
      hypertensive: !!data.hypertensive,
      diabetes: !!data.diabetes,
      cellphone: removeMask(data.cellphone),
      cpf: removeMask(data.cpf),
      emergencyContact: data.emergencyContact
        ? removeMask(data.emergencyContact)
        : undefined,
      profession: data.profession,
      zipCode: data.zipCode === '' ? undefined : data.zipCode,
      street: data.street === '' ? undefined : data.street,
      number: data.number === '' ? undefined : data.number,
      indicatedBy: data.indicatedBy === '' ? undefined : data.indicatedBy,
      religion: data.religion === '' ? undefined : data.religion,
      congregation: data.congregation === '' ? undefined : data.congregation,
      pastorName: data.pastorName === '' ? undefined : data.pastorName,
      notes: data.notes === '' ? undefined : data.notes,
      leadershipPosition:
        data.leadershipPosition ===
          ENUM_OPTION_LEADERSHIP_POSITION.NOT_POSITION ||
        data.leadershipPosition === ''
          ? undefined
          : data.leadershipPosition,
      role: 5,
      // a senha escolhida; o servidor guarda só o hash
      password: data.password,
    };

    mutatePostCreateUser(formatData);
  }

  /**
   * O formulário tem quatro blocos e passa da dobra: sem este aviso, quem erra
   * um campo lá em cima clica em "Criar cadastro" e a tela parece não responder.
   * O foco no primeiro erro é do react-hook-form; o aviso diz o porquê do pulo.
   */
  function onInvalidForm() {
    toast.error('Confira os campos destacados para concluir o cadastro.');
  }

  const styles = {
    raiz: {
      minHeight: '100vh',
      // no celular a barra do navegador come parte da 100vh e corta o rodapé
      '@supports (min-height: 100dvh)': { minHeight: '100dvh' },
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'background.default',
      px: { xs: 2, sm: 4 },
      py: { xs: 3, sm: 6 },
    },
    coluna: {
      width: '100%',
      // largura de leitura para o formulário: acima disso os campos de uma
      // coluna só esticam e o olho perde a ligação entre rótulo e campo
      maxWidth: 880,
    },
    topo: {
      minHeight: 34,
      mb: { xs: 1, sm: 1.5 },
    },
    cabecalho: {
      alignItems: 'center',
      textAlign: 'center',
      mb: { xs: 3, sm: 4 },
    },
    marca: {
      width: { xs: 38, md: 46 },
      height: 'auto',
    },
    logo: {
      width: '100%',
      height: '100%',
      fill: theme.palette.primary.main,
    },
    sobrenome: {
      color: 'text.secondary',
      fontSize: { xs: '0.7rem', sm: '0.8rem' },
      fontWeight: 600,
      letterSpacing: '1.6px',
      textTransform: 'uppercase',
      mt: 1,
    },
    titulo: {
      fontWeight: 600,
      fontSize: { xs: '1.75rem', md: '2.125rem' },
      letterSpacing: '-0.5px',
      lineHeight: 1.15,
      mt: { xs: 1.5, sm: 2 },
    },
    subtitulo: {
      color: 'text.secondary',
      fontSize: { xs: '0.875rem', md: '0.9375rem' },
      lineHeight: 1.6,
      mt: 1,
      // o texto não acompanha a largura do cartão: linha curta lê melhor
      maxWidth: 520,
    },
    /**
     * Aqui o cartão existe nos dois tamanhos de tela, ao contrário do login: o
     * formulário é longo e precisa de uma borda visível que diga onde ele
     * começa e onde termina dentro da página.
     */
    cartao: {
      backgroundColor: 'background.paperSecondary',
      borderRadius: 4,
      p: { xs: 2.5, sm: 4 },
      boxShadow: escuro
        ? `0 24px 50px ${alpha('#000000', 0.5)}`
        : `0 24px 50px ${alpha('#1C0F4D', 0.14)}`,
    },
    obrigatorio: {
      color: 'text.secondary',
      fontSize: '0.8125rem',
    },
    /**
     * No celular o botão ocupa a linha inteira e vem primeiro; no desktop ele
     * fica à direita, no fim do caminho de leitura do formulário.
     */
    acoes: {
      display: 'flex',
      flexDirection: { xs: 'column-reverse', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      justifyContent: 'space-between',
      gap: 2,
      mt: 3,
    },
    enviar: {
      height: 46,
      px: 4,
      fontSize: '0.9375rem',
      fontWeight: 600,
      letterSpacing: '0.2px',
      alignSelf: { sm: 'flex-end' },
    },
    rodape: {
      justifyContent: 'center',
      alignItems: 'center',
      mt: 3,
    },
    entrar: {
      fontWeight: 600,
      minWidth: 'auto',
      px: 0.75,
      // o tema capitaliza todo botão; aqui o texto continua a frase
      textTransform: 'none',
    },
    copyright: {
      color: 'text.secondary',
      fontSize: '0.75rem',
      textAlign: 'center',
      lineHeight: 1.7,
      mt: 3,
    },
  };

  return (
    <Box sx={styles.raiz}>
      <Box sx={styles.coluna}>
        <Box sx={styles.topo}>
          {/* Quem chega pelo login não tem para onde voltar dentro do app — a
              saída dele é o "Já tem cadastro?" no rodapé. A seta só faz sentido
              para quem já está autenticado e abriu esta tela de dentro. */}
          {permission && (
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              aria-label="Voltar"
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Stack sx={styles.cabecalho}>
          <Box sx={styles.marca}>
            <Logo style={styles.logo} />
          </Box>

          <Typography sx={styles.sobrenome}>ICCV Eventos</Typography>

          <Typography component="h1" sx={styles.titulo}>
            Faça seu cadastro
          </Typography>

          <Typography sx={styles.subtitulo}>
            Preencha seus dados uma única vez. Com o cadastro pronto, sua
            inscrição nos próximos eventos leva poucos cliques.
          </Typography>
        </Stack>

        <Box sx={styles.cartao}>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmitForm, onInvalidForm)}>
              <Form />
              <SecaoDaSenha />

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  sx={{ alignItems: 'flex-start', m: 0 }}
                  control={
                    <Checkbox
                      checked={aceitouTermos}
                      onChange={(evento) => {
                        setAceitouTermos(evento.target.checked);
                        if (evento.target.checked) setFaltaAceite(false);
                      }}
                      sx={{ mt: -0.75 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      Li e aceito os{' '}
                      <Link
                        component={RouterLink}
                        to="/termos"
                        target="_blank"
                        rel="noopener"
                        sx={{ fontWeight: 600 }}
                      >
                        Termos de Uso
                      </Link>
                      . Se este cadastro for de menor de idade, declaro ser o
                      responsável legal por ele.
                    </Typography>
                  }
                />
                {faltaAceite && (
                  <FormHelperText error sx={{ ml: 4.5 }}>
                    É preciso aceitar os Termos de Uso para criar o cadastro.
                  </FormHelperText>
                )}
              </Box>

              <Divider sx={{ mt: 3 }} />

              <Box sx={styles.acoes}>
                <Typography sx={styles.obrigatorio}>
                  Os campos marcados com * são obrigatórios.
                </Typography>

                <Button
                  variant="contained"
                  type="submit"
                  sx={styles.enviar}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    'Criar cadastro'
                  )}
                </Button>
              </Box>
            </form>
          </FormProvider>
        </Box>

        {!permission && (
          <Stack direction="row" spacing={0.5} sx={styles.rodape}>
            <Typography variant="body2" color="text.secondary">
              Já tem cadastro?
            </Typography>
            <Button
              variant="text"
              sx={styles.entrar}
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
          </Stack>
        )}

        <Typography sx={styles.copyright}>
          © 2026 Igreja de Cristo Cidade Verde.
          <br /> Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  );
}

export { RegisterUser };
