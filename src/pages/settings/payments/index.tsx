import { Stack } from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { PaymentProviders } from '../../../features/settings/payments/components/paymentProviders';

/**
 * Configurações de cobrança.
 *
 * Fica nas configurações e não no painel da igreja porque é ajuste de sistema,
 * feito uma vez e revisitado raramente — e porque a tela de pagamentos do
 * painel é do financeiro, que dá baixa mas não escolhe a conta que recebe.
 */
function PaymentsSettings() {
  return (
    <PageStyle>
      <Header
        title="Pagamentos"
        description="Por onde cada igreja cobra as inscrições"
      />

      <Stack spacing={2.5}>
        <PaymentProviders />
      </Stack>
    </PageStyle>
  );
}

export { PaymentsSettings };
