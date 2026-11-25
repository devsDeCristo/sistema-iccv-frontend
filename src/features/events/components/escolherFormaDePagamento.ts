import Swal from 'sweetalert2';

import paypalLogo from '../../../assets/gateways/paypal.svg';
import mercadopagoLogo from '../../../assets/gateways/mercadopago.svg';
import pagbankLogo from '../../../assets/gateways/pagbank.svg';
import tonLogo from '../../../assets/gateways/ton.svg';

/** O que o servidor devolve quando o gateway pede a escolha antes do checkout */
export interface EscolhaDePagamento {
  provider: string;
  /** Nome comercial do gateway: `PayPal` */
  label: string;
  methods: string[];
  /**
   * O nome da outra saída, com o que a igreja ligou no checkout do gateway:
   * "Cartão ou boleto", "Cartão ou conta PayPal". Ausente em servidor antigo.
   */
  checkoutLabel?: string;
}

export type FormaDePagamento = 'PIX' | 'CREDIT_CARD';

/** A marca de quem processa o pagamento */
const LOGOS: Record<string, string> = {
  PAYPAL: paypalLogo,
  MERCADO_PAGO: mercadopagoLogo,
  PAGBANK: pagbankLogo,
  TON: tonLogo,
};

/**
 * Pergunta ao inscrito como ele quer pagar.
 *
 * Aparece quando a igreja tem o Pix ligado e mais alguma forma: o Pix é pago
 * aqui, com QR Code, e o resto (cartão, boleto, saldo) no site do gateway.
 * Sem Pix, ou só com ele, não há pergunta.
 *
 * A marca e a frase "processado pelo…" vão sempre: o inscrito precisa saber
 * para quem está pagando antes de escolher, e é esse nome que ele vai ver no
 * app do banco e na fatura.
 *
 * Devolve `null` quando a pessoa fecha sem escolher.
 */
export async function escolherFormaDePagamento(
  escolha: EscolhaDePagamento
): Promise<FormaDePagamento | null> {
  // Nós de texto, e não HTML montado: o nome do gateway vem do servidor
  const corpo = document.createElement('div');
  const linha = (texto: string, forte = false) => {
    const paragrafo = document.createElement('p');
    paragrafo.textContent = texto;
    paragrafo.style.margin = '0 0 8px';
    if (forte) paragrafo.style.fontWeight = '600';
    corpo.appendChild(paragrafo);
  };

  const outra = escolha.checkoutLabel ?? `Cartão ou conta ${escolha.label}`;

  linha(`O pagamento é processado pelo ${escolha.label}.`, true);
  linha('Pix: o QR Code aparece aqui mesmo, e a confirmação sai na hora.');
  linha(`${outra}: você conclui o pagamento no site do ${escolha.label}.`);

  const resultado = await Swal.fire({
    imageUrl: LOGOS[escolha.provider],
    imageWidth: 64,
    imageHeight: 64,
    imageAlt: escolha.label,
    title: 'Como você quer pagar?',
    html: corpo,
    showDenyButton: true,
    showCloseButton: true,
    confirmButtonText: 'Pix',
    denyButtonText: outra,
    // verde do Pix e azul na outra saída: o vermelho padrão do segundo botão
    // diria "cancelar", e as duas saídas aqui são pagar
    confirmButtonColor: '#1E9E8F',
    denyButtonColor: '#003087',
    // a pergunta abre por cima do modal de pagamentos e da tela de espera,
    // que ficam acima da camada padrão do alerta
    didOpen: () => {
      const camada = Swal.getContainer();
      if (camada) camada.style.zIndex = '2000';
    },
  });

  if (resultado.isConfirmed) return 'PIX';
  if (resultado.isDenied) return 'CREDIT_CARD';
  return null;
}
