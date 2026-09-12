import { createRoot } from 'react-dom/client';
import { Box, CssBaseline, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

import { myTheme } from './themes';
import { Header } from './components/header';
import { ChurchScopeBar } from './features/settings/shared/churchScopeBar';
import { EscopoDeIgreja } from './features/settings/shared/useIgrejaSelecionada';

const params = new URLSearchParams(location.search);
const escuro = params.get('tema') === 'escuro';

const varias: EscopoDeIgreja = {
  igrejas: [
    { id: 'a', name: 'Igreja Padrão' },
    { id: 'b', name: 'Igreja de Maringá' },
    { id: 'c', name: 'Igreja de Londrina' },
  ],
  churchId: 'a',
  escolher: () => undefined,
  carregando: false,
  podeTrocar: true,
  semIgreja: false,
};

const uma: EscopoDeIgreja = {
  ...varias,
  igrejas: [{ id: 'a', name: 'Igreja de Maringá' }],
  churchId: 'a',
  podeTrocar: false,
};

createRoot(document.getElementById('root') as Element).render(
  <MemoryRouter>
    <ThemeProvider theme={myTheme(escuro)}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', p: 3 }}>
        <Stack spacing={4} sx={{ maxWidth: 1000, mx: 'auto' }}>
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.disabled">
              VÁRIAS IGREJAS — alternável
            </Typography>
            <Header title="Pagamentos" description="Por onde cada igreja cobra as inscrições">
              <ChurchScopeBar escopo={varias} oQueMuda="a própria conta de recebimento" />
            </Header>
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.disabled">
              UMA IGREJA SÓ — vira rótulo
            </Typography>
            <Header title="Disparadores" description="Canais que a igreja usa para avisar os inscritos">
              <ChurchScopeBar escopo={uma} oQueMuda="o próprio número de disparo" />
            </Header>
          </Box>
        </Stack>
      </Box>
    </ThemeProvider>
  </MemoryRouter>
);

if (params.has('abrir')) {
  setTimeout(() => {
    document.querySelector<HTMLElement>('button.MuiButtonBase-root')?.click();
  }, 400);
}
