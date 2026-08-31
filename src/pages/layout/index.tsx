import { Outlet, useLoaderData } from 'react-router-dom';
import SideBar, { AreaSideBar } from '../../components/sideBar';
import MenuAppBar from '../../components/appBar';
import { Box, Stack } from '@mui/material';
import { useUser } from '../../contexts/userContext';
import { User } from '../../types/user';
import { useEffect, useState } from 'react';

/** Altura da barra do topo (src/components/appBar) */
const ALTURA_APPBAR = 70;

const styles = {
  boxOutlet: {
    /**
     * Altura fixa, e não só um teto: é esta caixa que rola, então ela precisa
     * ocupar o que sobra da tela mesmo com pouco conteúdo — senão o fundo do
     * documento aparece embaixo, como uma faixa clara no fim da página.
     *
     * `dvh` porque, com a rolagem aqui dentro, a barra do navegador do celular
     * nunca recolhe: `100vh` já conta com ela recolhida e sobraria altura fora
     * da área visível.
     */
    height: `calc(100vh - ${ALTURA_APPBAR}px)`,
    '@supports (height: 100dvh)': {
      height: `calc(100dvh - ${ALTURA_APPBAR}px)`,
    },
    overflowY: 'auto',
    // o fundo é pintado aqui, e não só na página: página curta não deixa buraco
    bgcolor: 'background.default',
    // no iPhone a faixa do indicador de início fica por cima do conteúdo
    paddingBottom: 'env(safe-area-inset-bottom)',
    flexGrow: 1,
    width: '100%',
    gap: 2,
  },
};

export const Layout = ({
  isAdmin,
  area,
}: {
  isAdmin: boolean;
  /** Régua das configurações do sistema, que tem menu próprio */
  area?: AreaSideBar;
}) => {
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
      <MenuAppBar setOpenDrawer={setOpenDrawer} openDrawer={openDrawer} />
      <Stack direction={'row'}>
        <SideBar
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          isAdmin={isAdmin}
          area={area}
        />
        <Box sx={styles.boxOutlet} id="layout-scroll">
          <Outlet />
        </Box>
      </Stack>
    </Stack>
  );
};
