import { Alert, Box, Stack } from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import { PluggyIntegrationCard } from '../../../features/settings/integrations/pluggyIntegration';

/**
 * Integrações da igreja com serviços de fora. Hoje só a Pluggy, que dá ao
 * tesouraria acesso aos bancos da igreja; a próxima entra como outro card aqui.
 */
function IntegrationsSettings() {
  // a tesouraria também configura: a Pluggy alimenta o módulo dela
  const escopo = useIgrejaSelecionada(true);

  return (
    <PageStyle>
      <Header
        title="Integrações"
        description="Serviços externos ligados a cada igreja"
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="as próprias integrações" />
      </Header>

      <Stack spacing={2.5}>
        {escopo.precisaEscolher ? (
          <Alert severity="info">
            Escolha no topo da página qual igreja você quer configurar: cada
            igreja tem as próprias integrações.
          </Alert>
        ) : escopo.semIgreja ? (
          <Alert severity="info">
            Você não é admin nem tesouraria de nenhuma igreja. As integrações
            são configuradas por igreja.
          </Alert>
        ) : (
          escopo.churchId && (
            // grade de cards, como os gateways em Pagamentos: a próxima
            // integração entra como mais um card ao lado
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 2,
                alignItems: 'stretch',
              }}
            >
              <PluggyIntegrationCard
                key={escopo.churchId}
                churchId={escopo.churchId}
              />
            </Box>
          )
        )}
      </Stack>
    </PageStyle>
  );
}

export { IntegrationsSettings };
