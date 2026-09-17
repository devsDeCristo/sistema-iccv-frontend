import { API_URL } from '../config/env';

export async function imageUrlToDataUrl(
  url?: string | null
): Promise<string | null> {
  if (!url) return null;

  if (url.startsWith('data:')) {
    return url;
  }

  const normalizedUrl = url.startsWith('http')
    ? url
    : new URL(url, API_URL).toString();

  try {
    const response = await fetch(normalizedUrl);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
/**
 * Reduz a foto no navegador e devolve a data URL que vai para o banco.
 *
 * A foto do produto é gravada em base64 na própria linha e volta inteira em
 * toda abertura do evento: uma foto de celular de 4 MB viraria 5,5 MB de texto
 * por produto, por visita. Com o lado maior em 800px ela fica na casa das
 * dezenas de KB e continua nítida no cartão.
 *
 * WebP quando o navegador codifica (o Safari antigo devolve PNG calado, bem
 * maior); JPEG no resto. O fundo branco entra antes do desenho porque o JPEG
 * não tem transparência, e PNG transparente viraria fundo preto.
 */
export async function reduzirFotoParaDataUrl(
  arquivo: File,
  ladoMaximo = 800,
  qualidade = 0.82
): Promise<string> {
  const url = URL.createObjectURL(arquivo);

  try {
    const imagem = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Não foi possível ler a imagem'));
      img.src = url;
    });

    const escala = Math.min(
      1,
      ladoMaximo / Math.max(imagem.naturalWidth, imagem.naturalHeight)
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(imagem.naturalWidth * escala);
    canvas.height = Math.round(imagem.naturalHeight * escala);

    const contexto = canvas.getContext('2d');
    if (!contexto) throw new Error('Não foi possível processar a imagem');

    contexto.fillStyle = '#FFFFFF';
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

    const webp = canvas.toDataURL('image/webp', qualidade);

    return webp.startsWith('data:image/webp')
      ? webp
      : canvas.toDataURL('image/jpeg', qualidade);
  } finally {
    URL.revokeObjectURL(url);
  }
}
