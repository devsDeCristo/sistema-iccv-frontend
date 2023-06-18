import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { People, Event } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function SideBar() {
  const image =
    'https://www.holiness.org.br/wp-content/uploads/2021/04/cruz.jpg';

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
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
        </Menu>
      </Sidebar>
    </div>
  );
}

export { SideBar };
