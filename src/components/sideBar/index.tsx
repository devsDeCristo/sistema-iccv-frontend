import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { People, Event, Logout, Menu as MenuIcon } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

type SideBarProps = {
  validRole?: Boolean | null;
  isAdmin?: Boolean;
};

const SideBar: React.FC<SideBarProps> = ({
  validRole = true,
  isAdmin = false,
}) => {
  const [openDrawer, setOpenDrawer] = useState(false);
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
          title: 'Eventos',
        },
      ];
  const styles = {
    boxContainer: {
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      minWidth: '340px',
      flexDirection: { xs: 'column', lg: 'row' },
    },
    boxSidebar: (validRole: boolean | Boolean | null) => ({
      display: validRole ? { xs: 'none', lg: 'flex' } : 'none',
      boxShadow: '0px 1px 4px 0px' + theme.palette.border,
      position: 'sticky',
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
  };
  return (
    <Box display={'flex'}>
      <CssBaseline />
      <Box sx={styles.boxContainer}>
        <Box sx={styles.boxSidebar(validRole)}>
          <Sidebar className="sidebar">
            <Menu>
              <MenuItem className="menu1">
                <h2>ICCV</h2>
              </MenuItem>
              {optionsPages.map(({ link, itemId, icon, title }) => (
                <MenuItem
                  id={itemId}
                  icon={icon}
                  component={<Link to={link} />}
                >
                  {title}
                </MenuItem>
              ))}
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
          <Sidebar className="sidebar">
            <Menu>
              <MenuItem
                className="menu1"
                component={<Link to={'/admin/eventos'} />}
                onClick={() => setOpenDrawer(false)}
              >
                <h2>ICCV</h2>
              </MenuItem>
              {optionsPages.map(({ link, itemId, icon, title }) => (
                <MenuItem
                  id={itemId}
                  icon={icon}
                  component={<Link to={link} />}
                  onClick={() => setOpenDrawer(false)}
                >
                  {title}
                </MenuItem>
              ))}
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
        <AppBar
          position="sticky"
          sx={styles.boxAppBar(validRole)}
          elevation={0}
          variant="outlined"
        >
          <Container
            sx={{
              padding: 0,
              '&.MuiContainer-root': { paddingX: 0 },
              // maxWidth: '100vw',
            }}
          >
            <Toolbar sx={styles.toolbar} disableGutters>
              <IconButton onClick={() => setOpenDrawer(!openDrawer)}>
                <MenuIcon />
              </IconButton>
              <h2>ICCV</h2>
            </Toolbar>
          </Container>
        </AppBar>
        <Box sx={styles.boxOutlet}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SideBar;
