/**
 * As cores do evento, tiradas das próprias imagens.
 *
 * A paleta sai da logo (primária) e da capa (secundária e terciária) porque é
 * assim que o evento já se apresenta: quem faz a arte escolheu essas cores, e
 * pedir para o admin acertá-las de novo num seletor é pedir para ele errar.
 * Tudo aqui é sugestão — as três continuam editáveis à mão.
 */

/** Amostra pequena de propósito: a cor dominante não muda com a resolução, e
 * 80px por lado é o que separa uma varredura instantânea de uma que trava a
 * tela numa foto de celular. */
const LADO_DA_AMOSTRA = 80;

/** Distância mínima entre duas cores da paleta, no cubo RGB. Sem isso a capa
 * devolve três tons do mesmo azul, que na tela é uma cor só. */
const DISTANCIA_MINIMA = 60;

export type CoresDoEvento = {
  primary: string;
  secondary: string;
  tertiary: string;
};

/** Paleta de partida quando não há imagem nenhuma para ler. */
export const CORES_PADRAO: CoresDoEvento = {
  primary: '#2563EB',
  secondary: '#7C3AED',
  tertiary: '#0EA5E9',
};

export function ehCorHex(valor?: string | null): valor is string {
  return !!valor && /^#[0-9a-fA-F]{6}$/.test(valor);
}

function paraHex(r: number, g: number, b: number) {
  const parte = (valor: number) =>
    Math.max(0, Math.min(255, Math.round(valor)))
      .toString(16)
      .padStart(2, '0');

  return `#${parte(r)}${parte(g)}${parte(b)}`.toUpperCase();
}

function saturacao(r: number, g: number, b: number) {
  const maior = Math.max(r, g, b);
  const menor = Math.min(r, g, b);

  return maior === 0 ? 0 : (maior - menor) / maior;
}

function distancia(a: number[], b: number[]) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function carregarImagem(fonte: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imagem = new Image();
    if (!fonte.startsWith('data:')) imagem.crossOrigin = 'anonymous';
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () => reject(new Error('Não foi possível ler a imagem'));
    imagem.src = fonte;
  });
}

/**
 * As cores dominantes da imagem, da mais para a menos presente.
 *
 * Pixels transparentes ficam de fora — numa logo eles são o fundo, não a marca.
 * Quase-branco e quase-preto também: são o papel e o contorno, e uma paleta de
 * evento feita de `#FFFFFF` não diz nada.
 *
 * A contagem é por balde de cores próximas (5 bits por canal), e não por valor
 * exato: uma foto tem milhares de azuis levemente diferentes, e sem agrupar
 * nenhum deles é dominante.
 *
 * Lança quando a imagem não pode ser lida pixel a pixel — imagem de outro
 * domínio sem CORS contamina o canvas, e é o caso das que já estão salvas.
 */
export async function coresDaImagem(
  fonte: string,
  quantidade = 1
): Promise<string[]> {
  const imagem = await carregarImagem(fonte);

  const escala = Math.min(
    1,
    LADO_DA_AMOSTRA / Math.max(imagem.naturalWidth, imagem.naturalHeight)
  );
  const largura = Math.max(1, Math.round(imagem.naturalWidth * escala));
  const altura = Math.max(1, Math.round(imagem.naturalHeight * escala));

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext('2d', { willReadFrequently: true });
  if (!contexto) throw new Error('Não foi possível processar a imagem');

  contexto.drawImage(imagem, 0, 0, largura, altura);
  const { data } = contexto.getImageData(0, 0, largura, altura);

  const baldes = new Map<number, { soma: number[]; total: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (data[i + 3] < 128) continue;
    if (r > 242 && g > 242 && b > 242) continue;
    if (r < 14 && g < 14 && b < 14) continue;

    const chave = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const balde = baldes.get(chave) ?? { soma: [0, 0, 0], total: 0 };

    balde.soma[0] += r;
    balde.soma[1] += g;
    balde.soma[2] += b;
    balde.total += 1;
    baldes.set(chave, balde);
  }

  const candidatos = Array.from(baldes.values())
    .map(({ soma, total }) => {
      const media = soma.map((canal) => canal / total);

      return {
        media,
        // a cor viva ganha da cinzenta de mesmo tamanho: fundo neutro costuma
        // ocupar mais área que a marca, e é a marca que dá a identidade
        peso: total * (1 + 2 * saturacao(media[0], media[1], media[2])),
      };
    })
    .sort((a, b) => b.peso - a.peso);

  const escolhidas: number[][] = [];

  candidatos.forEach(({ media }) => {
    if (escolhidas.length >= quantidade) return;
    const repetida = escolhidas.some(
      (cor) => distancia(cor, media) < DISTANCIA_MINIMA
    );
    if (!repetida) escolhidas.push(media);
  });

  // imagem de duas cores não tem uma terceira: repetir a última é melhor que
  // devolver menos cores do que o formulário espera
  while (escolhidas.length < quantidade && escolhidas.length > 0) {
    escolhidas.push(escolhidas[escolhidas.length - 1]);
  }

  return escolhidas.map(([r, g, b]) => paraHex(r, g, b));
}

/**
 * O que vai para `data.colors` do evento.
 *
 * Só cor válida entra, e paleta vazia vira `undefined`: ausente, o servidor
 * mantém o que já estava salvo, enquanto um objeto pela metade apagaria as
 * cores de um evento antigo a cada edição.
 */
export function coresParaSalvar(valores: {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
}): Partial<CoresDoEvento> | undefined {
  const paleta: Partial<CoresDoEvento> = {};

  if (ehCorHex(valores.primaryColor)) paleta.primary = valores.primaryColor;
  if (ehCorHex(valores.secondaryColor)) {
    paleta.secondary = valores.secondaryColor;
  }
  if (ehCorHex(valores.tertiaryColor)) paleta.tertiary = valores.tertiaryColor;

  return Object.keys(paleta).length ? paleta : undefined;
}
