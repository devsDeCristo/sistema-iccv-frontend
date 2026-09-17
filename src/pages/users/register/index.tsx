import Swal from 'sweetalert2';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack } from '@mui/icons-material';

import { Form } from '../../../features/admin/users/components/form';
import { usePermission } from '../../../hooks/usePermission';
import {
  ENUM_OPTION_LEADERSHIP_POSITION,
  REGISTER_USERS_SCHEMA,
} from '../../../features/admin/users/constants';
import { RegisterUsersFormType } from '../../../types/user';
import { formatCPF, removeMask } from '../../../utils';
import { usePostCreateUser } from '../../../features/admin/users/api/postUser';
import Logo from '../../../assets/logo-ic.svg?react';

function RegisterUser() {
  const cpfLogin = localStorage.getItem('cpf') || '';
  const DEFAULT_VALUES: RegisterUsersFormType = {
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
    notes: '',
    leadershipPosition: '',
    indicatedBy: '',
    religion: '',
    congregation: '',
    pastorName: '',
  };
  const navigate = useNavigate();
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
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

  function onSubmitForm(data: RegisterUsersFormType) {
    const formatData = {
      ...data,
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
      password: '$2b$10$QGF/lucztAy.bqQFEQcSOOjP3fGMZfSsCIl4t.dfFo15Hh0v/C8xW',
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

              <Divider sx={{ mt: 4 }} />

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
