import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { People, Event, Logout } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';
import { Box, Drawer, useTheme } from '@mui/material';
import { useState } from 'react';

type SideBarProps = {
  validRole?: Boolean | null;
};

const SideBar: React.FC<SideBarProps> = ({ validRole = true }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  // const image =
  // ('https://www.holiness.org.br/wp-content/uploads/2021/04/cruz.jpg');
  const optionsPages = [
    {
      itemId: '1',
      link: '/',
      icon: <People />,
      title: 'Usuários',
    },
    {
      itemId: '2',
      link: '/eventos',
      icon: <Event />,
      title: 'Eventos',
    },
  ];
  return (
    <Box
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: validRole ? { xs: 'none', lg: 'flex' } : 'none',
        }}
      >
        <Sidebar className="sidebar">
          <Menu>
            <MenuItem className="menu1">
              <h2>ICCV</h2>
            </MenuItem>
            {optionsPages.map(({ link, itemId, icon, title }) => (
              <MenuItem id={itemId} icon={icon} component={<Link to={link} />}>
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
        sx={{ display: { xs: 'inline', lg: 'none' } }}
      ></Drawer>
      <Outlet />
    </Box>
  );
};

export { SideBar };
