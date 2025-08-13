import { Outlet } from 'react-router-dom';
import SideBar from '../../components/sideBar';
import MenuAppBar from '../../components/appBar';
import { Box, Stack } from '@mui/material';

const styles = {
  boxOutlet: {
    flexGrow: 1,
    width: '100%',
    gap: 2,
  },
};

export const Layout = ({ isAdmin }: { isAdmin: boolean }) => {
  return (
    <Stack sx={{ width: '100%', direction: 'column' }}>
      <MenuAppBar />
      <Stack direction={'row'}>
        <SideBar isAdmin={isAdmin} />
        <Box sx={styles.boxOutlet}>
          <Outlet />
        </Box>
      </Stack>
    </Stack>
  );
};
