import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';

import { DarkMode, LightMode, Logout, Settings } from '@mui/icons-material';

import { Avatar, Divider, ListItemIcon, Stack, useTheme } from '@mui/material';
import { useUser } from '../../contexts/userContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo-ic.svg?react';
import { useThemeContext } from '../../contexts/themeContext';

export default function MenuAppBar({
  setOpenDrawer,
  openDrawer,
}: {
  setOpenDrawer: (open: boolean) => void;
  openDrawer: boolean;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user, logout } = useUser();
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

  const styles = {
    menuIcon: { mr: 2, display: { xs: 'inline', lg: 'none' } },
  };
  const theme = useTheme();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        sx={{
          height: '70px',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.background.paperSecondary
              : theme.palette.primary.main,
        }}
        position="static"
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={styles.menuIcon}
            onClick={() => setOpenDrawer(!openDrawer)}
          >
            <MenuIcon />
          </IconButton>
          <Logo
            style={{
              height: '40px',
              width: 'auto',
              fill: 'white',
              margin: '10px',
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: 'white' }}
          >
            CIDADE VERDE
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="medium"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={toggleColorMode}
              color="inherit"
            >
              {colorMode ? <LightMode /> : <DarkMode />}
            </IconButton>
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar alt={user?.fullName} src="/static/images/avatar/1.jpg" />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Stack
                direction="row"
                justifyContent={'center'}
                alignItems="center"
                gap={2}
                sx={{ padding: 2 }}
              >
                <Avatar
                  alt={user?.fullName}
                  src="/static/images/avatar/1.jpg"
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
              {/* <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Perfil
              </MenuItem> */}
              {user?.role === 1 && !isAdminRoute && (
                <MenuItem
                  onClick={() => {
                    navigate('/admin/eventos');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Área do Administrador
                </MenuItem>
              )}
              {user?.role === 1 && isAdminRoute && (
                <MenuItem
                  onClick={() => {
                    navigate('/eventos');
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Área do Usuário
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
