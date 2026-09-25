import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

import {
  AdminPanelSettings,
  DarkMode,
  LightMode,
  Logout,
  Person,
  Tune,
  AccountCircleOutlined,
} from '@mui/icons-material';

import {
  alpha,
  ButtonBase,
  Divider,
  ListItemIcon,
  Stack,
  useTheme,
} from '@mui/material';
import { useUser } from '../../contexts/userContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo-ic.svg?react';
import { useThemeContext } from '../../contexts/themeContext';
import { useRole } from '../../hooks/useRole';
import { UserAvatar } from '../userAvatar';

export default function MenuAppBar({
  setOpenDrawer,
  openDrawer,
}: {
  setOpenDrawer: (open: boolean) => void;
  openDrawer: boolean;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user, logout } = useUser();
  const { canAccessAdminArea, isAdmin: isAdminRole } = useRole();
  const { colorMode, toggleColorMode } = useThemeContext();
  const navigate = useNavigate();
  const [isAdminRoute, setIsAdminRoute] = React.useState(false);

  //verifica se a rota url é de admin
  React.useEffect(() => {
    const isAdminRoute = window.location.pathname.includes('/admin');
    setIsAdminRoute(isAdminRoute);
  }, [window.location.pathname]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';

  /**
   * A foto some quando o contexto ainda não voltou do loader da rota; o storage
   * segura o primeiro quadro, do mesmo jeito que a faixa de boas-vindas faz.
   */
  const doStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeCompleto = user?.fullName || doStorage?.fullName || '';
  const foto = user?.profilePhotoUrl || doStorage?.profilePhotoUrl;

  const styles = {
    menuIcon: {
      mr: 1,
      display: { xs: 'inline-flex', lg: 'none' },
      color: '#fff',
    },
    /**
     * Cor chapada, sem tingimento nem brilho: o que mudou na barra é o
     * acabamento em volta — o fio claro embaixo no lugar da sombra dura, a
     * marca clicável e a pastilha de vidro das ações.
     */
    barra: {
      height: '70px',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: escuro
        ? theme.palette.background.paperSecondary
        : theme.palette.primary.main,
      borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
    },
    /** a marca vira botão: clicar nela é o caminho mais curto para a home */
    marca: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1,
      py: 0.5,
      borderRadius: 2,
      color: '#fff',
      transition: theme.transitions.create('background-color', {
        duration: 160,
      }),
      '&:hover': { backgroundColor: alpha('#fff', 0.1) },
    },
    nomeDoSistema: {
      fontSize: '1.05rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.1,
      color: '#fff',
      whiteSpace: 'nowrap',
    },
    /** tema e conta moram na mesma pastilha de vidro, como os selos do cartaz */
    acoes: {
      display: 'flex',
      alignItems: 'center',
      gap: 0.25,
      p: 0.4,
      borderRadius: 999,
      backgroundColor: alpha('#fff', 0.12),
      border: `1px solid ${alpha('#fff', 0.2)}`,
      backdropFilter: 'blur(6px)',
    },
    botaoDeTema: {
      color: '#fff',
      '&:hover': { backgroundColor: alpha('#fff', 0.16) },
    },
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar sx={styles.barra} position="static" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            size="large"
            edge="start"
            aria-label="menu"
            sx={styles.menuIcon}
            onClick={() => setOpenDrawer(!openDrawer)}
          >
            <MenuIcon />
          </IconButton>

          <ButtonBase
            sx={styles.marca}
            onClick={() => navigate(isAdminRoute ? '/admin/inicio' : '/home')}
          >
            <Logo style={{ height: '38px', width: 'auto', fill: 'white' }} />
            <Typography component="div" sx={styles.nomeDoSistema}>
              ICCV{' '}
              <Box
                component="span"
                sx={{ fontWeight: 400, color: alpha('#fff', 0.78) }}
              >
                Eventos
              </Box>
            </Typography>
          </ButtonBase>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" sx={styles.acoes}>
            <IconButton
              size="small"
              aria-label={colorMode ? 'Usar tema claro' : 'Usar tema escuro'}
              onClick={toggleColorMode}
              sx={styles.botaoDeTema}
            >
              {colorMode ? (
                <LightMode fontSize="small" />
              ) : (
                <DarkMode fontSize="small" />
              )}
            </IconButton>
            <IconButton
              size="small"
              aria-label="Conta"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ p: 0.25 }}
            >
              <UserAvatar
                name={nomeCompleto}
                photoUrl={foto}
                disablePreview
                sx={{ width: 32, height: 32, fontSize: '0.8rem' }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: { mt: 1, minWidth: 240, borderRadius: 3 },
              }}
            >
              <Stack
                direction="row"
                justifyContent={'center'}
                alignItems="center"
                gap={2}
                sx={{ padding: 2 }}
              >
                <UserAvatar
                  name={nomeCompleto}
                  photoUrl={foto}
                  disablePreview
                />
                <Stack>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {user?.fullName?.split(' ')[0]}{' '}
                    {user?.fullName?.split(' ')[1]}
                  </Typography>
                  <Typography
                    sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
                  >
                    {user?.email}
                  </Typography>
                </Stack>
              </Stack>
              <Divider sx={{ mb: 0.5 }} />
              <MenuItem
                onClick={() => {
                  navigate('/perfil');
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <AccountCircleOutlined fontSize="small" />
                </ListItemIcon>
                Meu perfil
              </MenuItem>
              {canAccessAdminArea && !isAdminRoute && (
                <MenuItem
                  onClick={() => {
                    navigate('/admin/inicio');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <AdminPanelSettings fontSize="small" />
                  </ListItemIcon>
                  Área do Administrador
                </MenuItem>
              )}
              {canAccessAdminArea && isAdminRoute && (
                <MenuItem
                  onClick={() => {
                    navigate('/home');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  Área do Usuário
                </MenuItem>
              )}

              {/*
                Configurações da igreja: a cobrança e o número de disparo são
                de quem administra a igreja, então o admin também entra — antes
                só o super admin via esta entrada, e o admin não tinha por onde
                chegar na própria configuração.

                O destino é `/configuracoes`, que redireciona: apontar direto
                para uma das telas mandava o dev para a de disparadores, que
                exigia super admin puro, e ele voltava para o painel sem
                explicação.
              */}
              {isAdminRole && (
                <MenuItem
                  onClick={() => {
                    navigate('/configuracoes');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Tune fontSize="small" />
                  </ListItemIcon>
                  Configurações
                </MenuItem>
              )}

              <MenuItem
                onClick={() => {
                  logout();
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
