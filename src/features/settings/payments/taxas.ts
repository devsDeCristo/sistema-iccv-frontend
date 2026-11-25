import { PROVIDER_PRICING } from './constants';

/** A forma de pagamento de cada linha da tabela publicada (`PROVIDER_PRICING`) */
const FORMA_DA_LINHA: Record<string, string> = {
  Pix: 'PIX',
  'Crédito à vista': 'CREDIT_CARD',
  Débito: 'DEBIT_CARD',
  Boleto: 'BOLETO',
};

/**
 * As taxas que já conhecemos de cada gateway, no **pior cenário** — o
 * recebimento na hora, que é a maior taxa publicada de cada forma. É com isso
 * que os campos do repasse nascem preenchidos; a igreja ajusta para o plano
 * dela, porque a API de nenhum gateway informa a taxa da conta.
 *
 * Só a parte percentual: a taxa fixa por transação ("+ R$ 0,40") não entra.
 */
export function taxasConhecidas(provider: string): Record<string, number> {
  const taxas: Record<string, number> = {};

  for (const linha of PROVIDER_PRICING[provider]?.fees ?? []) {
    const forma = FORMA_DA_LINHA[linha.label];
    const numero = linha.rate?.match(/(\d+(?:,\d+)?)\s*%/)?.[1];
    if (!forma || !numero) continue;

    const taxa = Number(numero.replace(',', '.'));
    taxas[forma] = Math.max(taxas[forma] ?? 0, taxa);
  }

  return taxas;
}

/** `PIX=0.99,CREDIT_CARD=4.98` ↔ `{ PIX: '0.99', CREDIT_CARD: '4.98' }` */
export const lerTaxas = (valor: string): Record<string, string> =>
  Object.fromEntries(
    (valor ?? '')
      .split(',')
      .filter(Boolean)
      .map((par) => par.split('=') as [string, string])
  );

export const gravarTaxas = (taxas: Record<string, string>) =>
  Object.entries(taxas)
    .map(([forma, taxa]) => `${forma}=${taxa}`)
    .join(',');

/** O que o servidor aceita: de 0 a 99,99, com até duas casas */
export const taxaValida = (texto: string) =>
  /^\d{1,2}(\.\d{1,2})?$/.test(texto ?? '');
