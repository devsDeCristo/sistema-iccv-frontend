import { Stack } from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { PaymentProviders } from '../../../features/settings/payments/components/paymentProviders';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';

/**
 * Configurações de cobrança.
 *
 * Fica nas configurações e não no painel da igreja porque é ajuste de sistema,
 * feito uma vez e revisitado raramente — e porque a tela de pagamentos do
 * painel é do financeiro, que dá baixa mas não escolhe a conta que recebe.
 */
function PaymentsSettings() {
  const escopo = useIgrejaSelecionada();

  return (
    <PageStyle>
      {/*
        O alternador de igreja vai no cabeçalho, na mesma linha do título: ele
        não é um passo da tela, é o recorte dela — "Pagamentos **de qual
        igreja**". Numa faixa própria abaixo do título ele parecia o primeiro
        campo de um formulário.
      */}
      <Header
        title="Pagamentos"
        description="Por onde cada igreja cobra as inscrições"
      >
        <ChurchScopeBar
          escopo={escopo}
          oQueMuda="a própria conta de recebimento"
        />
      </Header>

      <Stack spacing={2.5}>
        <PaymentProviders escopo={escopo} />
      </Stack>
    </PageStyle>
  );
}

export { PaymentsSettings };
