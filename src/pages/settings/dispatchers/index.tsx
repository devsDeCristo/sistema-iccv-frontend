import { Alert, Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { WhatsApp } from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { WhatsappConnection } from '../../../features/settings/whatsapp/components/whatsappConnection';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';

/**
 * Disparadores da igreja. Hoje só o WhatsApp; a barra de abas já existe para o
 * próximo entrar do lado, sem remexer na tela.
 *
 * O número é por igreja: cada uma pareia o seu e a notícia sai pelo telefone de
 * quem publicou. Era um só para o sistema inteiro, e por isso a tela era do
 * super admin — parear ou desconectar atingia o aviso de todas. Agora quem
 * administra a igreja mexe na dela e não alcança ninguém.
 */
function Dispatchers() {
  const [aba, setAba] = useState(0);
  const escopo = useIgrejaSelecionada();

  return (
    <PageStyle>
      {/* Ver a nota na tela de Pagamentos: o alternador é o recorte da
          página, não um passo dela, e por isso divide a linha do título. */}
      <Header
        title="Disparadores"
        description="Canais que a igreja usa para avisar os inscritos"
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="o próprio número de disparo" />
      </Header>

      <Stack spacing={2.5}>
        {escopo.semIgreja ? (
          <Alert severity="info">
            Você não administra nenhuma igreja. O número de disparo é
            configurado por igreja, por quem administra ela.
          </Alert>
        ) : (
          <>
            <Tabs
              value={aba}
              onChange={(_, valor) => setAba(valor)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                icon={<WhatsApp fontSize="small" />}
                iconPosition="start"
                label="WhatsApp"
                sx={{ textTransform: 'none', minHeight: 48 }}
              />
            </Tabs>

            {aba === 0 && escopo.churchId && (
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cada notícia publicada por esta igreja sai para os grupos
                    marcados nela, um de cada vez e com intervalo entre um envio
                    e outro — pelo número conectado aqui.
                  </Typography>
                </Box>

                {/* `key` remonta o painel ao trocar de igreja: sem isso o QR e o
                    código de pareamento da anterior ficariam na tela até a
                    primeira resposta da nova chegar */}
                <WhatsappConnection
                  key={escopo.churchId}
                  churchId={escopo.churchId}
                />
              </Stack>
            )}
          </>
        )}
      </Stack>
    </PageStyle>
  );
}

export { Dispatchers };
