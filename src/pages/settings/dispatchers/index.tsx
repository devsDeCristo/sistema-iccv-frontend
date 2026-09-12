import { Alert, Stack, Typography } from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { WhatsappConnection } from '../../../features/settings/whatsapp/components/whatsappConnection';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';

/**
 * O canal de WhatsApp da igreja.
 *
 * O número é por igreja: cada uma pareia o seu e a notícia sai pelo telefone de
 * quem publicou. Era um só para o sistema inteiro, e por isso a tela era do
 * super admin — parear ou desconectar atingia o aviso de todas. Agora quem
 * administra a igreja mexe na dela e não alcança ninguém.
 *
 * Isto já foi uma aba dentro de "Disparadores". Virou tela própria, listada na
 * régua como filha do grupo: aba esconde o que está atrás dela — quem abria
 * "Disparadores" via WhatsApp e não tinha como saber que era uma escolha entre
 * canais —, e não tem endereço próprio para favoritar ou mandar para alguém.
 * O segundo canal entra como outro arquivo ao lado deste, sem remexer aqui.
 */
function DispatcherWhatsapp() {
  const escopo = useIgrejaSelecionada();

  return (
    <PageStyle>
      <Header
        title="WhatsApp"
        description="O número que avisa os inscritos desta igreja"
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
          escopo.churchId && (
            <>
              <Typography variant="body2" color="text.secondary">
                Cada notícia publicada por esta igreja sai para os grupos
                marcados nela, um de cada vez e com intervalo entre um envio e
                outro — pelo número conectado aqui.
              </Typography>

              {/* `key` remonta o painel ao trocar de igreja: sem isso o QR e o
                  código de pareamento da anterior ficariam na tela até a
                  primeira resposta da nova chegar */}
              <WhatsappConnection
                key={escopo.churchId}
                churchId={escopo.churchId}
              />
            </>
          )
        )}
      </Stack>
    </PageStyle>
  );
}

export { DispatcherWhatsapp };
