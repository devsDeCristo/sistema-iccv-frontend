import { Sidebar, Menu, MenuItem, sidebarClasses } from 'react-pro-sidebar';
import { People, Event, Logout, ConfirmationNumber } from '@mui/icons-material';
import { Link, NavLink } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Logo from '../../assets/logo-ic.svg?react';

type SideBarProps = {
  validRole?: Boolean | null;
  isAdmin?: Boolean;
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
};

const SideBar: React.FC<SideBarProps> = ({
  validRole = true,
  isAdmin = false,
  openDrawer,
  setOpenDrawer,
}) => {
  const theme = useTheme();
  // const image =
  // ('https://www.holiness.org.br/wp-content/uploads/2021/04/cruz.jpg');
  const optionsPages = isAdmin
    ? [
        {
          itemId: '1',
          link: '/admin/usuarios',
          icon: <People />,
          title: 'Usuários',
        },
        {
          itemId: '2',
          link: '/admin/eventos',
          icon: <Event />,
          title: 'Eventos',
        },
      ]
    : [
        {
          itemId: '1',
          link: '/eventos',
          icon: <Event />,
          title: 'Eventos Abertos',
        },
        {
          itemId: '2',
          link: '/minhasInscricoes',
          icon: <ConfirmationNumber />,
          title: 'Minhas Inscrições',
        },
      ];
  const styles = {
    boxContainer: {
      display: 'flex',
      height: 'calc(100vh - 70px)',
      //width: '100%',
      //minWidth: '340px',
      flexDirection: { xs: 'column', lg: 'row' },
    },
    boxSidebar: (validRole: boolean | Boolean | null) => ({
      display: validRole ? { xs: 'none', lg: 'flex' } : 'none',
      // boxShadow: '0px 1px 4px 0px' + theme.palette.border,
      position: 'sticky',
      bgcolor: theme.palette.background.paper,
    }),
    boxSidebarMobile: { display: { xs: 'inline', lg: 'none' } },
    boxAppBar: (validRole: boolean | Boolean | null) => ({
      // /display: "relative",
      display: validRole ? { xs: 'flex', lg: 'none' } : 'none',
      minWidth: '350px',
      width: '100%',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      position: 'sticky',
      top: 0,
      left: 0,
      // right: '950',
      bgcolor: theme.palette.background.paper,
      //border: "none",
      // borderBottom: '1px solid ' + theme.palette.border,
      boxShadow: '0px 1px 4px 0px' + theme.palette.border,
      zIndex: 1200,
    }),
    toolbar: {
      width: '100%',
      padding: 0,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      pr: 5,
      pl: 3,
      color: theme.palette.text.primary,
    },
    appBarContainer: {
      padding: 0,
      '&.MuiContainer-root': { paddingX: 0 },
    },
    boxOutlet: {
      flexGrow: 1,
      // paddingTop: 5,
      width: '100%',
      // width: 'calc(100vw - 250px)',
      gap: 2,
      // minWidth: 'calc(100vw - 250px)',
    },
    buttonMenu: {
      '&:hover': {
        backgroundColor: theme.palette.background.hover,
        color: theme.palette.text.primary,
      },
      '&.active': {
        backgroundColor: theme.palette.background.hover,
        color: theme.palette.text.primary,
        fontWeight: 500,
        borderRight: `3px solid ${theme.palette.primary.main}`,
      },
    },
    sessaoMenu: {
      px: 2,
      mt: 2,
      fontWeight: 'bold',
      fontSize: 14,
      color: 'gray',
    },
  };
  return (
    <Box sx={styles.boxContainer}>
      <CssBaseline />
      <Box sx={styles.boxSidebar(validRole)}>
        <Sidebar
          rootStyles={{
            borderRight: 'none',
            [`& .${sidebarClasses.container}`]: {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <Menu
            menuItemStyles={{
              button: () => styles.buttonMenu,
            }}
          >
            <Box sx={styles.sessaoMenu}>
              {isAdmin ? 'Administrador' : 'Inscrições'}
            </Box>
            {optionsPages.map(({ link, itemId, icon, title }) => (
              <MenuItem
                key={itemId}
                id={itemId}
                icon={icon}
                component={<NavLink to={link} />}
              >
                {title}
              </MenuItem>
            ))}
          </Menu>
          <Menu
            style={{ position: 'absolute', bottom: 0, width: '100%' }}
            menuItemStyles={{
              button: () => styles.buttonMenu,
            }}
          >
            <MenuItem
              icon={<Logout />}
              onClick={() => {
                localStorage.clear();
              }}
              component={<Link to="/login" />}
            >
              Sair
            </MenuItem>
          </Menu>
        </Sidebar>
      </Box>
      <Drawer
        variant="temporary"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        sx={styles.boxSidebarMobile}
      >
        <Sidebar
          rootStyles={{
            borderRight: 'none',
            [`& .${sidebarClasses.container}`]: {
              backgroundColor: theme.palette.background.paper,
              height: '100vh',
            },
          }}
        >
          <Menu
            menuItemStyles={{
              button: () => styles.buttonMenu,
            }}
       
          >
            <MenuItem
              className="menu1"
              component={<Link to={'/admin/eventos'} />}
              onClick={() => setOpenDrawer(false)}
            >
              <Stack direction="row" alignItems="center">
                <Logo
                  style={{
                    height: '40px',
                    width: 'auto',
                    margin: '10px',
                    fill: theme.palette.text.primary
                  }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ flexGrow: 1, color: theme.palette.text.primary }}
                >
                  CIDADE VERDE
                </Typography>
              </Stack>
            </MenuItem>

            <Box sx={styles.sessaoMenu}>
              {isAdmin ? 'Administrador' : 'Inscrições'}
            </Box>
            {optionsPages.map(({ link, itemId, icon, title }) => (
              <MenuItem
                key={itemId}
                id={itemId}
                icon={icon}
                component={<Link to={link} />}
                onClick={() => setOpenDrawer(false)}
              >
                {title}
              </MenuItem>
            ))}
          </Menu>
          <Menu
            style={{ position: 'absolute', bottom: 10, width: '100%' }}
            menuItemStyles={{
              button: () => styles.buttonMenu,
            }}
          >
            <MenuItem
              icon={<Logout />}
              onClick={() => {
                localStorage.clear();
              }}
              component={<Link to="/login" />}
            >
              Sair
            </MenuItem>
          </Menu>
        </Sidebar>
      </Drawer>
    </Box>
  );
};

export default SideBar;
