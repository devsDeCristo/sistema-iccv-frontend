import { ProviderPricing } from './types';

export const GET_PAYMENT_PROVIDERS = 'GET_PAYMENT_PROVIDERS';

/**
 * O apelido de cada casa na URL da API. Espelha `src/gateways/core/provider-slug.ts`
 * no backend — é o mesmo apelido que aparece na URL de notificação, e é por
 * isso que ele não segue o valor do enum em minúsculas.
 */
export const PROVIDER_SLUG: Record<string, string> = {
  PAGBANK: 'pagbank',
  MERCADO_PAGO: 'mercadopago',
  INFINITEPAY: 'infinitepay',
  TON: 'ton',
};

/**
 * O que cada casa cobra, do jeito que ela publica.
 *
 * Fica no front porque é material de escolha, não de cobrança: nenhuma conta
 * do sistema usa estes números. O valor que sai da inscrição é sempre o que a
 * casa aplica no repasse dela, e o painel da casa é quem manda.
 *
 * Nenhum número aqui é promessa. Todas negociam taxa por faturamento, e a que
 * a igreja paga de verdade só aparece no painel dela. É por isso que cada
 * bloco leva a data da consulta e o link da fonte — número de tabela velho
 * precisa parecer velho, e quem está escolhendo precisa poder conferir.
 *
 * Forma aceita sem preço publicado entra com `rate: null` em vez de ficar de
 * fora: sumir com a linha faria parecer que a casa não aceita boleto, e o que
 * se sabe é outra coisa — que ela aceita e não diz na tabela quanto custa.
 *
 * As taxas são as do **checkout / link de pagamento**, que é como o sistema
 * cobra. Não valem para maquininha, que quase sempre tem outra tabela.
 */
export const PROVIDER_PRICING: Record<string, ProviderPricing> = {
  PAGBANK: {
    checkedAt: 'set/2026',
    sourceUrl: 'https://pagbank.com.br/para-seu-negocio/online/checkout',
    fees: [
      { label: 'Pix', rate: '1,89%', settlement: 'na hora' },
      { label: 'Débito', rate: '2,39%', settlement: 'em 1 dia' },
      {
        label: 'Crédito à vista',
        rate: '4,99% + R$ 0,40',
        settlement: 'em 14 dias',
      },
      {
        label: 'Crédito à vista',
        rate: '3,99% + R$ 0,40',
        settlement: 'em 30 dias',
      },
      {
        label: 'Crédito parcelado',
        rate: '2,99% ao mês',
        settlement: 'juros do inscrito',
      },
      { label: 'Boleto', rate: null },
    ],
  },

  MERCADO_PAGO: {
    checkedAt: 'set/2026',
    sourceUrl: 'https://www.mercadopago.com.br/ajuda/33399',
    fees: [
      { label: 'Pix', rate: '0%', settlement: 'na hora' },
      { label: 'Crédito à vista', rate: '4,98%', settlement: 'na hora' },
      { label: 'Crédito à vista', rate: '3,98%', settlement: 'em 30 dias' },
      { label: 'Débito', rate: null },
      { label: 'Boleto', rate: null },
    ],
  },

  INFINITEPAY: {
    checkedAt: 'set/2026',
    sourceUrl: 'https://www.infinitepay.io/taxas',
    note: 'A taxa cai conforme o faturamento do mês.',
    fees: [
      { label: 'Pix', rate: '0%', settlement: 'em 1 dia útil' },
      {
        label: 'Crédito à vista',
        rate: 'a partir de 2,29%',
        settlement: 'em 1 dia útil',
      },
      {
        label: 'Crédito em 12x',
        rate: 'a partir de 5,39%',
        settlement: 'em 1 dia útil',
      },
    ],
  },

  TON: {
    checkedAt: 'set/2026',
    sourceUrl: 'https://www.ton.com.br/link-de-pagamento',
    note: 'O Ton só publica a tabela do link no app, em Minhas taxas e prazos.',
    fees: [
      { label: 'Pix', rate: '0%' },
      { label: 'Crédito à vista', rate: null },
      { label: 'Crédito em 12x', rate: '18,99%' },
      { label: 'Boleto', rate: null },
    ],
  },
};

/**
 * Como o endereço de notificação chega até a casa.
 *
 * `por-cobranca`: o sistema manda a URL dentro da própria chamada que cria a
 * cobrança (`payment_notification_urls` no PagBank, `notification_url` na
 * preferência do Mercado Pago, `webhook_url` no link da InfinitePay). Não há
 * nada a cadastrar em painel nenhum — quem administra a igreja só precisa das
 * credenciais.
 *
 * `painel`: a casa não aceita URL por cobrança, e o endereço só existe se
 * alguém cadastrar na conta. É o caso do Ton: a API v5 da Pagar.me resolve
 * webhook por conta, não por pedido. Sem esse cadastro a cobrança é criada e
 * paga normalmente, e a baixa nunca chega.
 *
 * Espelha o que cada adapter faz em `createCheckout`. Mudar o adapter sem
 * mudar aqui deixa a tela mandando a pessoa fazer trabalho à toa — ou, pior,
 * calada sobre um cadastro que ela precisa fazer.
 */
export type WebhookSetup = 'por-cobranca' | 'painel';

export const PROVIDER_WEBHOOK_SETUP: Record<string, WebhookSetup> = {
  PAGBANK: 'por-cobranca',
  MERCADO_PAGO: 'por-cobranca',
  INFINITEPAY: 'por-cobranca',
  TON: 'painel',
};
