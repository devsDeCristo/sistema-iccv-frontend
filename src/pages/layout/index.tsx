import { Outlet, useLoaderData } from 'react-router-dom';
import SideBar from '../../components/sideBar';
import MenuAppBar from '../../components/appBar';
import { Box, Stack } from '@mui/material';
import { useUser } from '../../contexts/userContext';
import { User } from '../../types/user';
import { useEffect, useState } from 'react';

const styles = {
  boxOutlet: {
    maxHeight: 'calc(100vh - 70px)',
    overflowY: 'auto',
    flexGrow: 1,
    width: '100%',
    gap: 2,
  },
};

export const Layout = ({ isAdmin }: { isAdmin: boolean }) => {
  const loaderData = useLoaderData() as User;
  const [openDrawer, setOpenDrawer] = useState(false);
  const { setUser } = useUser();

  useEffect(() => {
    if (loaderData) {
     setUser(loaderData);
    }
  }, [loaderData, setUser]);

  return (
    <Stack sx={{ width: '100%', direction: 'column' }}>
     
        <MenuAppBar setOpenDrawer={setOpenDrawer} openDrawer={openDrawer}   />
        <Stack direction={'row'}>
          <SideBar openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} isAdmin={isAdmin} />
          <Box sx={styles.boxOutlet}>
            <Outlet />
          </Box>
        </Stack>
     
    </Stack>
  );
};
