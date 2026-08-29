import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { WhatsApp } from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { WhatsappConnection } from '../../../features/settings/whatsapp/components/whatsappConnection';

/**
 * Disparadores do sistema. Hoje só o WhatsApp; a barra de abas já existe para o
 * próximo entrar do lado, sem remexer na tela.
 */
function Dispatchers() {
  const [aba, setAba] = useState(0);

  return (
    <PageStyle>
      <Header
        title="Disparadores"
        description="Canais que o sistema usa para avisar os inscritos"
      />

      <Tabs
        value={aba}
        onChange={(_, valor) => setAba(valor)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab
          icon={<WhatsApp fontSize="small" />}
          iconPosition="start"
          label="WhatsApp"
          sx={{ textTransform: 'none', minHeight: 48 }}
        />
      </Tabs>

      {aba === 0 && (
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              O sistema entra como um aparelho conectado deste número, do mesmo
              jeito que o WhatsApp Web. Cada notícia publicada sai para os grupos
              vinculados aos eventos marcados nela.
            </Typography>
          </Box>

          <WhatsappConnection />
        </Stack>
      )}
    </PageStyle>
  );
}

export { Dispatchers };
