import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { People, Event, Logout } from '@mui/icons-material';
import { Link, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

type SideBarProps = {
  validRole?: Boolean | null;
};

const SideBar: React.FC<SideBarProps> = ({ validRole = true }) => {
  const image =
    'https://www.holiness.org.br/wp-content/uploads/2021/04/cruz.jpg';

  return (
    <Box style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Box
        sx={{
          display: validRole ? 'flex' : 'none',
          // display: { xs: 'none', sm: 'flex' },
        }}
      >
        <Sidebar className="sidebar" image={image}>
          <Menu>
            <MenuItem className="menu1">
              <h2>ICCV</h2>
            </MenuItem>
            <MenuItem icon={<People />} component={<Link to="/" />}>
              Usuários
            </MenuItem>
            <MenuItem icon={<Event />} component={<Link to="/eventos" />}>
              Eventos
            </MenuItem>
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
      <Outlet />
    </Box>
  );
};

export { SideBar };
