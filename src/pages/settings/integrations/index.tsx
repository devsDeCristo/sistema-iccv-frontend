import { Alert, Stack } from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import { PluggyIntegrationCard } from '../../../features/settings/integrations/pluggyIntegration';

/**
 * Integrações da igreja com serviços de fora. Hoje só a Pluggy, que dá ao
 * financeiro acesso aos bancos da igreja; a próxima entra como outro card aqui.
 */
function IntegrationsSettings() {
  // o financeiro também configura: a Pluggy alimenta o módulo dele
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
            Você não é admin nem financeiro de nenhuma igreja. As integrações
            são configuradas por igreja.
          </Alert>
        ) : (
          escopo.churchId && (
            <PluggyIntegrationCard
              key={escopo.churchId}
              churchId={escopo.churchId}
            />
          )
        )}
      </Stack>
    </PageStyle>
  );
}

export { IntegrationsSettings };
