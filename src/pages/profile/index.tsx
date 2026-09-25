import { ReactNode, useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink } from 'react-router-dom';
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  BadgeOutlined,
  LockOutlined,
  MailOutline,
  PersonOutline,
  PhotoCameraOutlined,
  ShieldOutlined,
  UploadFileOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { PageStyle } from '../../components/pageStyle';
import { Input } from '../../components/input';
import { Form } from '../../features/admin/users/components/form';
import { UserAvatar } from '../../components/userAvatar';
import { WebcamModal } from '../../features/admin/users/components/webcamModal';
import { REGISTER_USERS_SCHEMA } from '../../features/admin/users/constants';
import {
  formValuesToUserPayload,
  userToFormValues,
} from '../../features/admin/users/utils';
import { NEW_PASSWORD_SCHEMA } from '../../features/login/constants';
import {
  mensagemDoErro,
  useChangePassword,
  useGetMe,
  usePostMyPhoto,
  usePutMe,
} from '../../features/profile/api';
import { setStoredUser } from '../../auth/session';
import { useUser } from '../../contexts/userContext';
import { RegisterUsersFormType, User } from '../../types/user';
import { AZUL_VIVO, VIOLETA_VIVO } from '../../themes';
import { formatCPF } from '../../utils';

const TROCA_DE_SENHA = z
  .object({ currentPassword: z.string().min(1, 'Informe a senha atual') })
  .and(NEW_PASSWORD_SCHEMA);
type TrocaDeSenha = z.infer<typeof TROCA_DE_SENHA>;

/** Campo de senha com o botão de mostrar, como no login e na redefinição */
function CampoDeSenha({
  label,
  value,
  onChange,
  erro,
  autoComplete,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  erro?: string;
  autoComplete: 'current-password' | 'new-password';
  autoFocus?: boolean;
}) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <Input
      required
      autoFocus={autoFocus}
      label={label}
      autoComplete={autoComplete}
      type={mostrar ? 'text' : 'password'}
      value={value}
      onChange={(evento) => onChange(evento.target.value)}
      error={!!erro}
      errorMessage={erro}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="Mostrar ou esconder a senha"
              onClick={() => setMostrar((atual) => !atual)}
              onMouseDown={(evento) => evento.preventDefault()}
            >
              {mostrar ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

/**
 * Os dados do próprio cadastro. O CPF fica travado; trocar o e-mail pede a
 * senha atual antes de salvar — o servidor exige as duas coisas de qualquer
 * forma (`PUT /users/me`), a tela só avisa antes.
 */
function MeusDados({ eu, aoSalvar }: { eu: User; aoSalvar: () => void }) {
  const metodos = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: userToFormValues(eu),
  });
  const { mutate: salvar, isLoading } = usePutMe();
  const [pedindoSenha, setPedindoSenha] = useState<ReturnType<
    typeof formValuesToUserPayload
  > | null>(null);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [erroDaSenha, setErroDaSenha] = useState<string>();

  useEffect(() => {
    metodos.reset(userToFormValues(eu));
  }, [eu]);

  const enviar = (
    corpo: ReturnType<typeof formValuesToUserPayload>,
    currentPassword?: string
  ) =>
    salvar(
      { ...corpo, ...(currentPassword ? { currentPassword } : {}) },
      {
        onSuccess: () => {
          setPedindoSenha(null);
          setSenhaAtual('');
          toast.success('Dados atualizados.');
          aoSalvar();
        },
        onError: (erro) => {
          const mensagem = mensagemDoErro(
            erro,
            'Não foi possível salvar. Tente novamente.'
          );
          // a senha errada volta para o campo da janela, não para um aviso solto
          if (currentPassword) setErroDaSenha(mensagem);
          else toast.error(mensagem);
        },
      }
    );

  const aoEnviar = (dados: RegisterUsersFormType) => {
    const corpo = formValuesToUserPayload(dados);
    const trocouEmail =
      corpo.email.trim().toLowerCase() !== eu.email.trim().toLowerCase();

    if (trocouEmail) {
      setErroDaSenha(undefined);
      setPedindoSenha(corpo);
      return;
    }
    enviar(corpo);
  };

  return (
    <FormProvider {...metodos}>
      <form
        onSubmit={metodos.handleSubmit(aoEnviar, () =>
          toast.error('Confira os campos destacados.')
        )}
      >
        <Form cpfTravado />
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 180, borderRadius: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </Stack>
      </form>

      <Dialog
        open={!!pedindoSenha}
        onClose={() => !isLoading && setPedindoSenha(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirme a sua senha</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            O e-mail é por onde chega a redefinição de senha. Para trocá-lo,
            confirme a sua senha atual.
          </Typography>
          <CampoDeSenha
            autoFocus
            label="Senha atual"
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(valor) => {
              setSenhaAtual(valor);
              setErroDaSenha(undefined);
            }}
            erro={erroDaSenha}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            color="inherit"
            onClick={() => setPedindoSenha(null)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!senhaAtual || isLoading}
            onClick={() => pedindoSenha && enviar(pedindoSenha, senhaAtual)}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}

/** Troca de senha: a atual confere no servidor antes de qualquer mudança */
function MinhaSenha() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrocaDeSenha>({
    resolver: zodResolver(TROCA_DE_SENHA),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });
  const { mutate: trocar, isLoading } = useChangePassword();

  const aoEnviar = ({ currentPassword, password }: TrocaDeSenha) =>
    trocar(
      { currentPassword, password },
      {
        onSuccess: () => {
          reset();
          toast.success('Senha alterada. Enviamos um aviso para o seu e-mail.');
        },
        onError: (erro) => {
          toast.error(mensagemDoErro(erro, 'Não foi possível trocar a senha.'));
        },
      }
    );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(aoEnviar)}
      sx={{ maxWidth: 460 }}
    >
      <Stack gap={2.25}>
        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => (
            <CampoDeSenha
              label="Senha atual"
              autoComplete="current-password"
              value={field.value}
              onChange={field.onChange}
              erro={errors.currentPassword?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <CampoDeSenha
              label="Nova senha"
              autoComplete="new-password"
              value={field.value}
              onChange={field.onChange}
              erro={errors.password?.message}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <CampoDeSenha
              label="Digite a nova senha novamente"
              autoComplete="new-password"
              value={field.value}
              onChange={field.onChange}
              erro={errors.confirmPassword?.message}
            />
          )}
        />
        <Typography variant="body2" color="text.secondary">
          Use pelo menos 8 caracteres. Não lembra a senha atual?{' '}
          <Link component={RouterLink} to="/esqueci-senha" fontWeight={600}>
            Redefina por e-mail
          </Link>
          .
        </Typography>
        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 180, borderRadius: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Trocar senha'
            )}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

/** Um selo de vidro na faixa do topo, como os do cartaz do evento */
function Selo({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.1,
        py: 0.35,
        borderRadius: 999,
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'text.secondary',
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        '& svg': { fontSize: 15 },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * A faixa do topo: a mesma linguagem da abertura da home e do painel — o
 * degradê azul-violeta, as duas luzes e a foto com o anel de cor. A foto troca
 * pelo botão de câmera sobre ela, e não por um seletor com dois botões grandes.
 */
function CabecalhoDoPerfil({
  eu,
  previa,
  enviando,
  aoEscolherArquivo,
  aoAbrirCamera,
}: {
  eu: User;
  previa?: string;
  enviando: boolean;
  aoEscolherArquivo: (arquivo: File) => void;
  aoAbrirCamera: () => void;
}) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const arquivo = useRef<HTMLInputElement>(null);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        backgroundImage: `linear-gradient(115deg, ${alpha(
          AZUL_VIVO,
          escuro ? 0.16 : 0.2
        )} 0%, ${alpha(VIOLETA_VIVO, escuro ? 0.1 : 0.14)} 42%, transparent 78%)`,
        border: `1px solid ${alpha(AZUL_VIVO, escuro ? 0.16 : 0.18)}`,
        boxShadow: `0 18px 40px -28px ${alpha(AZUL_VIVO, escuro ? 0.45 : 0.6)}`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -140,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, ${alpha(
            AZUL_VIVO,
            escuro ? 0.16 : 0.24
          )}, transparent 70%)`,
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 3 }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ position: 'relative' }}
      >
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Box
            sx={{
              p: '3px',
              borderRadius: '50%',
              display: 'flex',
              backgroundImage: `linear-gradient(135deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
              boxShadow: `0 10px 24px -12px ${alpha(AZUL_VIVO, escuro ? 0.5 : 0.9)}`,
            }}
          >
            <UserAvatar
              name={eu.fullName}
              photoUrl={previa ?? eu.profilePhotoUrl}
              sx={{
                width: { xs: 84, md: 96 },
                height: { xs: 84, md: 96 },
                fontSize: '2rem',
                fontWeight: 700,
                // sem foto, as iniciais na cor da marca, e não no cinza padrão
                color: AZUL_VIVO,
                bgcolor: alpha(AZUL_VIVO, escuro ? 0.22 : 0.12),
                border: `3px solid ${theme.palette.background.paper}`,
              }}
            />
          </Box>
          {enviando && (
            <Box
              sx={{
                position: 'absolute',
                inset: 3,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: alpha('#000', 0.45),
              }}
            >
              <CircularProgress size={28} sx={{ color: '#fff' }} />
            </Box>
          )}
          <Tooltip title="Trocar foto">
            <IconButton
              size="small"
              aria-label="Trocar foto"
              disabled={enviando}
              onClick={(evento) => setMenu(evento.currentTarget)}
              sx={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 34,
                height: 34,
                color: '#fff',
                backgroundImage: `linear-gradient(135deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
                border: `3px solid ${theme.palette.background.paper}`,
                '&:hover': { filter: 'brightness(1.1)' },
              }}
            >
              <PhotoCameraOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menu}
            open={!!menu}
            onClose={() => setMenu(null)}
            PaperProps={{ sx: { borderRadius: 2, mt: 0.5 } }}
          >
            <MenuItem
              onClick={() => {
                setMenu(null);
                aoAbrirCamera();
              }}
            >
              <ListItemIcon>
                <PhotoCameraOutlined fontSize="small" />
              </ListItemIcon>
              Tirar foto com a câmera
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenu(null);
                arquivo.current?.click();
              }}
            >
              <ListItemIcon>
                <UploadFileOutlined fontSize="small" />
              </ListItemIcon>
              Escolher arquivo
            </MenuItem>
          </Menu>
          <input
            ref={arquivo}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(evento) => {
              const escolhido = evento.target.files?.[0];
              evento.target.value = '';
              if (escolhido) aoEscolherArquivo(escolhido);
            }}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'text.secondary',
            }}
          >
            MEU PERFIL
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.45rem', md: '1.75rem' },
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              wordBreak: 'break-word',
              backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {eu.fullName}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.25 }}>
            <Selo>
              <MailOutline />
              {eu.email}
            </Selo>
            <Selo>
              <BadgeOutlined />
              CPF {formatCPF(eu.cpf)}
            </Selo>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

/** Aba de segurança: o que acontece ao trocar a senha, ao lado do formulário */
function Seguranca() {
  const theme = useTheme();
  const itens = [
    'Pedimos a senha atual para confirmar que é você.',
    'Você recebe um aviso por e-mail sempre que a senha muda.',
    'Depois de 5 tentativas com a senha atual errada, a troca fica bloqueada por 15 minutos.',
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 3, md: 5 },
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 1fr) minmax(0, 1.15fr)',
        },
        alignItems: 'start',
      }}
    >
      <Box>
        <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ShieldOutlined />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Senha de acesso</Typography>
            <Typography variant="body2" color="text.secondary">
              Você entra com o seu CPF e esta senha
            </Typography>
          </Box>
        </Stack>
        <Stack gap={1} component="ul" sx={{ m: 0, pl: 2.5 }}>
          {itens.map((item) => (
            <Typography
              key={item}
              component="li"
              variant="body2"
              color="text.secondary"
            >
              {item}
            </Typography>
          ))}
        </Stack>
      </Box>
      <MinhaSenha />
    </Box>
  );
}

/**
 * Perfil de quem está logado: foto, dados e senha.
 *
 * Tudo aqui passa pelas rotas `me` da API, com o id tirado do token — a tela
 * não tem como pedir o cadastro de outra pessoa, nem por engano.
 */
function Profile() {
  const theme = useTheme();
  const { setUser } = useUser();
  const { data: eu, isLoading, refetch } = useGetMe();
  const { mutate: enviarFoto, isLoading: enviandoFoto } = usePostMyPhoto();
  const [aba, setAba] = useState<'dados' | 'seguranca'>('dados');
  const [webcamAberta, setWebcamAberta] = useState(false);
  const [previa, setPrevia] = useState<string>();

  useEffect(
    () => () => {
      if (previa) URL.revokeObjectURL(previa);
    },
    [previa]
  );

  /** a barra do topo mostra nome, e-mail e foto: ficam em dia com o perfil */
  const sincronizar = async () => {
    const { data: novo } = await refetch();
    if (!novo) return;
    setStoredUser(novo);
    setUser(novo);
  };

  const escolherFoto = (arquivo: File) => {
    setWebcamAberta(false);
    setPrevia(URL.createObjectURL(arquivo));
    enviarFoto(arquivo, {
      onSuccess: () => {
        toast.success('Foto atualizada.');
        sincronizar();
      },
      onError: (erro) => {
        setPrevia(undefined);
        toast.error(mensagemDoErro(erro, 'Não foi possível enviar a foto.'));
      },
    });
  };

  return (
    <PageStyle>
      {isLoading || !eu ? (
        <Stack gap={2}>
          <Skeleton variant="rounded" height={150} />
          <Skeleton variant="rounded" height={420} />
        </Stack>
      ) : (
        <Stack gap={2.5}>
          <CabecalhoDoPerfil
            eu={eu}
            previa={previa}
            enviando={enviandoFoto}
            aoEscolherArquivo={escolherFoto}
            aoAbrirCamera={() => setWebcamAberta(true)}
          />

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={aba}
              onChange={(_, valor) => setAba(valor)}
              sx={{
                px: { xs: 1, md: 2 },
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 56,
                },
              }}
            >
              <Tab
                value="dados"
                icon={<PersonOutline fontSize="small" />}
                iconPosition="start"
                label="Meus dados"
              />
              <Tab
                value="seguranca"
                icon={<LockOutlined fontSize="small" />}
                iconPosition="start"
                label="Segurança"
              />
            </Tabs>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {aba === 'dados' ? (
                <MeusDados eu={eu} aoSalvar={sincronizar} />
              ) : (
                <Seguranca />
              )}
            </Box>
          </Paper>
        </Stack>
      )}

      <WebcamModal
        isOpen={webcamAberta}
        onClose={() => setWebcamAberta(false)}
        onSelectPhoto={escolherFoto}
      />
    </PageStyle>
  );
}

export { Profile };
