/** Espelha `PaymentProvider` no backend */
export type PaymentProviderKey =
  'PAGBANK' | 'MERCADO_PAGO' | 'INFINITEPAY' | 'TON';

export type PaymentProviderMode = 'SANDBOX' | 'PRODUCTION';

/**
 * Um campo do formulário, declarado pelo adapter no backend.
 *
 * O formulário é desenhado a partir desta lista e não de um layout fixo por
 * casa: quando o backend ganha uma integração nova, ela aparece aqui pronta,
 * com os campos certos, sem precisar de deploy do front.
 */
export interface CredentialField {
  key: string;
  label: string;
  required: boolean;
  /** Segredo: sai mascarado e o campo em branco significa "não mexi nele" */
  secret: boolean;
  help?: string;
  placeholder?: string;
  allowedHostSuffixes?: string[];
}

export interface WebhookUrl {
  key: string;
  label: string;
  url: string;
}

/** O estado de uma casa nesta igreja, junto do que ela pede para funcionar */
export interface PaymentProviderIntegration {
  provider: PaymentProviderKey;
  label: string;
  summary: string;
  paymentMethods: string[];
  fields: CredentialField[];
  docsUrl: string;
  /** A casa assina a notificação? Quando não, a URL vira material sensível. */
  signsWebhook: boolean;
  webhookChannels: { key: string; label: string }[];

  configured: boolean;
  enabled: boolean;
  isDefault: boolean;
  mode: PaymentProviderMode;
  /** O que foi cadastrado, mascarado: `{ token: '••••4F2A' }` */
  credentialsHint: Record<string, string> | null;
  lastWebhookAt: string | null;
  updatedAt: string | null;
  webhooks: WebhookUrl[];
}

export interface PaymentProvidersResponse {
  /**
   * O servidor tem chave de criptografia configurada. Sem ela não adianta
   * abrir o formulário: o salvar falharia.
   */
  cofreDisponivel: boolean;
  integracoes: PaymentProviderIntegration[];
}

export interface SavePaymentProviderPayload {
  mode?: PaymentProviderMode;
  enabled?: boolean;
  makeDefault?: boolean;
  credentials: Record<string, string>;
}

export interface GatewayHealth {
  ok: boolean;
  message: string;
  account?: string;
}

/** Rótulo de cada forma de pagamento nas listas da tela */
export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PIX: 'Pix',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
};

/** Uma linha da tabela de preço de uma casa */
export interface ProviderFee {
  /** A forma de pagamento como o inscrito a vê: `Crédito à vista` */
  label: string;
  /** `1,89%`, `4,99% + R$ 0,40`, `a partir de 2,29%`. Nulo: a casa não publica. */
  rate: string | null;
  /** Quando o dinheiro entra: `na hora`, `em 14 dias` */
  settlement?: string;
}

/** O que uma casa cobra, do jeito que ela publica. Ver `PROVIDER_PRICING`. */
export interface ProviderPricing {
  fees: ProviderFee[];
  /** A página de onde os números saíram, para quem quiser conferir */
  sourceUrl: string;
  /** Mês da consulta, já formatado: `set/2026` */
  checkedAt: string;
  /** O que mais precisa ser dito antes de comparar uma casa com a outra */
  note?: string;
}
