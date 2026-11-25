/**
 * A taxa de serviço que a igreja repassa ao inscrito, em pontos percentuais,
 * por caminho: `pix` é a do Pix pago na tela do sistema (nula quando o Pix não
 * é pago lá); `checkout`, a do checkout do gateway. Vem do servidor
 * (`serviceFee`), nula quando a igreja não repassa.
 */
export interface TaxaDeServico {
  pix: number | null;
  checkout: number;
}

/**
 * O valor com a taxa, pela mesma conta do servidor (por divisão, em centavos):
 * a igreja recebe `valor` depois que o gateway desconta a taxa dele.
 */
export function comTaxa(valor: number, percentual?: number | null): number {
  if (!percentual || valor <= 0) return valor;
  const centavos = Math.round(valor * 100);
  return Math.round(centavos / (1 - percentual / 100)) / 100;
}

/** `4.98` → `4,98%` */
export const formatarPercentual = (percentual: number) =>
  `${String(percentual).replace('.', ',')}%`;

/**
 * A frase da taxa para quando o valor ainda não tem forma escolhida: "+ taxa
 * de serviço de 4,98%", ou com o Pix à parte quando ele tem a sua.
 */
export function avisoDaTaxa(taxa?: TaxaDeServico | null): string | null {
  if (!taxa) return null;
  const { pix, checkout } = taxa;
  if (!checkout && !pix) return null;
  if (pix == null || pix === checkout) {
    return `+ taxa de serviço de ${formatarPercentual(checkout)}`;
  }
  return `+ taxa de serviço: ${formatarPercentual(pix)} no Pix, até ${formatarPercentual(checkout)} nas outras formas`;
}
