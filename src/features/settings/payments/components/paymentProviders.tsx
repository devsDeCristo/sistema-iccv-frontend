import { useState } from 'react';
import { Alert, Box, Skeleton, Stack, Typography } from '@mui/material';

import { ChurchScopeBar } from '../../shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../shared/useIgrejaSelecionada';
import { useGetPaymentProviders } from '../api/getPaymentProviders';
import { ProviderCard } from './providerCard';
import { ProviderForm } from './providerForm';
import { RecebendoAgora } from './recebendoAgora';
import { PaymentProviderIntegration } from '../types';

/**
 * Por onde cada igreja cobra.
 *
 * A igreja vem antes de tudo na tela — ver `ChurchScopeBar`. É ela que define
 * de quem é o dinheiro: a mesma pessoa pode administrar duas, e cadastrar a
 * credencial de uma na outra manda a inscrição inteira para a conta errada.
 */
function PaymentProviders() {
  const escopo = useIgrejaSelecionada();
  const [editando, setEditando] = useState<PaymentProviderIntegration | null>(
    null
  );

  const { data, isLoading } = useGetPaymentProviders(escopo.churchId);

  if (escopo.semIgreja) {
    return (
      <Alert severity="info">
        Você não administra nenhuma igreja. A forma de cobrança é configurada
        por igreja, por quem administra ela.
      </Alert>
    );
  }

  const padrao = data?.integracoes.find((i) => i.isDefault) ?? null;

  return (
    <Stack spacing={2.5}>
      <ChurchScopeBar
        escopo={escopo}
        oQueMuda="a própria conta de recebimento"
      />

      {data && !data.cofreDisponivel && (
        <Alert severity="error">
          O servidor está sem a chave que protege as credenciais (
          <code>PAYMENT_CREDENTIALS_KEY</code>). Enquanto ela não for
          configurada, nenhuma integração pode ser cadastrada nem usada. Fale
          com o suporte técnico.
        </Alert>
      )}

      {isLoading || escopo.carregando ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={92} />
          <Skeleton variant="rounded" height={220} />
        </Stack>
      ) : (
        <>
          <RecebendoAgora integracao={padrao} />

          <Box
            sx={{
              display: 'grid',
              // duas colunas a partir do tablet; no celular uma, porque o
              // cartão carrega URL longa e não sobrevive a metade da largura
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              alignItems: 'stretch',
            }}
          >
            {data?.integracoes.map((integracao) => (
              <ProviderCard
                key={integracao.provider}
                churchId={escopo.churchId as string}
                integracao={integracao}
                onConfigurar={() => setEditando(integracao)}
              />
            ))}
          </Box>
        </>
      )}

      <Typography variant="caption" color="text.secondary">
        As credenciais ficam cifradas no banco e não são exibidas depois de
        salvas. Só quem administra a igreja alcança esta tela — o financeiro dá
        baixa em pagamento, mas não escolhe a conta que recebe.
      </Typography>

      <ProviderForm
        churchId={escopo.churchId as string}
        integracao={editando}
        onClose={() => setEditando(null)}
      />
    </Stack>
  );
}

export { PaymentProviders };
