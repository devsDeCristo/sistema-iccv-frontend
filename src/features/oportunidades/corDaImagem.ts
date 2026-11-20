import { darken, getContrastRatio, lighten } from '@mui/material/styles';

/**
 * A cor dominante de uma imagem local (a logo que o admin acabou de escolher).
 * Reduz para 48×48 e agrupa os pixels em baldes de cor, pesando pela
 * saturação: ganha a cor "de marca", e não o fundo branco nem o texto preto.
 * Logo sem cor nenhuma (preto e branco) devolve `null` — o crachá fica com a
 * cor do módulo.
 *
 * Roda com o arquivo ainda no navegador: ler os pixels de uma imagem do bucket
 * esbarraria no CORS.
 */
export async function corDaImagem(arquivo: File): Promise<string | null> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, falha) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = falha;
      i.src = url;
    });
    const lado = 48;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = lado;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, lado, lado);
    const { data } = ctx.getImageData(0, 0, lado, lado);

    const baldes = new Map<
      number,
      { peso: number; r: number; g: number; b: number; n: number }
    >();
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 128) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturacao = max === 0 ? 0 : (max - min) / max;
      const luz = (max + min) / 510;
      if (saturacao < 0.25 || luz > 0.92 || luz < 0.08) continue;
      const chave = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      const balde = baldes.get(chave) ?? { peso: 0, r: 0, g: 0, b: 0, n: 0 };
      balde.peso += saturacao;
      balde.r += r;
      balde.g += g;
      balde.b += b;
      balde.n += 1;
      baldes.set(chave, balde);
    }

    let melhor:
      { peso: number; r: number; g: number; b: number; n: number } | undefined;
    baldes.forEach((b) => {
      if (!melhor || b.peso > melhor.peso) melhor = b;
    });
    if (!melhor) return null;
    const { r, g, b, n } = melhor;
    const hex = (v: number) =>
      Math.round(v / n)
        .toString(16)
        .padStart(2, '0');
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * A cor ajustada até ler bem sobre o fundo (4,5:1, o mínimo de texto):
 * escurece no papel claro, clareia no escuro.
 */
export function legivelSobre(cor: string, fundo: string, minimo = 4.5) {
  const escuro =
    getContrastRatio(fundo, '#fff') > getContrastRatio(fundo, '#000');
  let atual = cor;
  for (let i = 0; i < 12 && getContrastRatio(atual, fundo) < minimo; i++) {
    atual = escuro ? lighten(atual, 0.12) : darken(atual, 0.12);
  }
  return atual;
}

/** Texto branco ou quase preto, o que ler melhor sobre a cor */
export const textoSobre = (cor: string) =>
  getContrastRatio(cor, '#fff') >= 3 ? '#fff' : '#16181D';
