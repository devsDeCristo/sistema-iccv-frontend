import { NavTabs } from '../../../../components/navTabs';
import { PaymentResponse } from '../../../../types/user';
import { descreverPagamento } from '../products';

interface AbasDosPagamentosProps {
  /** os pagamentos da pessoa; com um só, as abas não aparecem */
  pagamentos?: PaymentResponse[];
  /** o pagamento aberto no modal */
  atual?: { id?: string } | null;
  onTrocar?: (pagamento: PaymentResponse) => void;
}

/**
 * Abas dos modais de pagamento (editar e histórico) quando a linha junta mais
 * de um pagamento da mesma pessoa — a aba "Todos" do financeiro. O menu da
 * linha é um só; é por aqui que se anda entre a inscrição e as compras
 * avulsas, cada uma com o próprio formulário e histórico.
 */
function AbasDosPagamentos({
  pagamentos = [],
  atual,
  onTrocar,
}: AbasDosPagamentosProps) {
  if (pagamentos.length < 2 || !onTrocar) return null;

  return (
    <NavTabs
      bare
      fullWidth
      value={atual?.id ?? false}
      onChange={(id) => {
        const pagamento = pagamentos.find((p) => p.id === id);
        if (pagamento) onTrocar(pagamento);
      }}
      options={pagamentos.map((pagamento) => ({
        value: pagamento.id,
        label: descreverPagamento(pagamento),
      }))}
      sx={{ mt: 2 }}
    />
  );
}

export { AbasDosPagamentos };
