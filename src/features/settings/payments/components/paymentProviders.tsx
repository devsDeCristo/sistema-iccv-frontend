import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import { SelectField } from '../../../../components/selectField';
import { useRole } from '../../../../hooks/useRole';
import { useGetChurches } from '../../../admin/churches/api/getChurches';
import { useGetPaymentProviders } from '../api/getPaymentProviders';
import { ProviderCard } from './providerCard';
import { ProviderForm } from './providerForm';
import { PaymentProviderIntegration } from '../types';

/**
 * Por onde cada igreja cobra.
 *
 * A igreja vem antes de tudo na tela porque é ela que define de quem é o
 * dinheiro: a mesma pessoa pode administrar duas, e a credencial de uma não
 * vale na outra. Quem administra uma só não escolhe nada — o seletor some.
 */
function PaymentProviders() {
  const { isSuperAdmin, igrejasQueAdministra } = useRole();
  const [editando, setEditando] = useState<PaymentProviderIntegration | null>(
    null
  );

  // O super admin não tem vínculo: as igrejas dele vêm da listagem, e só ele
  // alcança essa rota.
  const { data: todasAsIgrejas, isLoading: carregandoIgrejas } = useGetChurches(
    { enabled: isSuperAdmin }
  );

  const igrejas = useMemo(
    () =>
      isSuperAdmin
        ? (todasAsIgrejas ?? []).map((i) => ({ id: i.id, name: i.name }))
        : igrejasQueAdministra,
    [isSuperAdmin, todasAsIgrejas, igrejasQueAdministra]
  );

  const [churchIdEscolhida, setChurchId] = useState<string | null>(null);
  const churchId = churchIdEscolhida ?? igrejas[0]?.id ?? null;

  const { data, isLoading } = useGetPaymentProviders(churchId);

  if (carregandoIgrejas) {
    return <Skeleton variant="rounded" height={180} />;
  }

  if (!igrejas.length) {
    return (
      <Alert severity="info">
        Você não administra nenhuma igreja. A forma de cobrança é configurada
        por igreja, por quem administra ela.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      {igrejas.length > 1 && (
        <Box sx={{ maxWidth: 360 }}>
          <SelectField
            label="Igreja"
            value={churchId ?? ''}
            onChange={setChurchId}
            options={igrejas.map((igreja) => ({
              value: igreja.id,
              label: igreja.name,
            }))}
          />
        </Box>
      )}

      {data && !data.cofreDisponivel && (
        <Alert severity="error">
          O servidor está sem a chave que protege as credenciais
          (<code>PAYMENT_CREDENTIALS_KEY</code>). Enquanto ela não for
          configurada, nenhuma integração pode ser cadastrada nem usada. Fale
          com o suporte técnico.
        </Alert>
      )}

      {data && data.cofreDisponivel && !data.integracoes.some((i) => i.isDefault) && (
        <Alert severity="warning">
          Nenhuma casa está recebendo: os inscritos desta igreja não conseguem
          pagar pelo sistema. Configure uma e marque como “Usar esta”.
        </Alert>
      )}

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={200} />
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            // duas colunas a partir do tablet; no celular uma, porque o cartão
            // carrega URL longa e não sobrevive a metade da largura
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          {data?.integracoes.map((integracao) => (
            <ProviderCard
              key={integracao.provider}
              churchId={churchId as string}
              integracao={integracao}
              onConfigurar={() => setEditando(integracao)}
            />
          ))}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary">
        As credenciais ficam cifradas no banco e não são exibidas depois de
        salvas. Só quem administra a igreja alcança esta tela — o financeiro dá
        baixa em pagamento, mas não escolhe a conta que recebe.
      </Typography>

      <ProviderForm
        churchId={churchId as string}
        integracao={editando}
        onClose={() => setEditando(null)}
      />
    </Stack>
  );
}

export { PaymentProviders };
