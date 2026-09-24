import { AxiosError } from 'axios';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { PdfNameCase, PdfSection } from '../../../../types/pdf';
import { formatNameCase, limitToTwoNames } from '../../../../utils';

/** Uma seção como o servidor recebe: o cabeçalho e os nomes já formatados */
interface SecaoDeCrachas {
  title: string | null;
  badges: { userId: string; name: string }[];
}

/**
 * Monta o pedido a partir das seções do modal. Quem não tem nome de crachá
 * fica de fora — é assim desde o react-pdf, e o card de status da tela de
 * usuários avisa quantos são.
 *
 * O nome vai pronto: só o crachá corta em duas palavras, e a caixa (maiúsculo,
 * minúsculo) é escolha do modal.
 */
function montarSecoes(
  sections: PdfSection[],
  nameCase: PdfNameCase
): SecaoDeCrachas[] {
  return sections.map((section) => ({
    title: section.title,
    badges: section.users
      .filter((user) => !!user.badgeName)
      .map((user) => ({
        userId: user.id,
        name: formatNameCase(limitToTwoNames(user.badgeName || ''), nameCase),
      })),
  }));
}

interface GerarCrachasParams {
  eventId: string;
  sections: PdfSection[];
  nameCase: PdfNameCase;
  blankCount?: number;
  withQrCode: boolean;
}

/**
 * O PDF de crachás, gerado no servidor (Puppeteer).
 *
 * A capa e a logo do evento são buscadas lá: aqui não precisa mais pedir o
 * evento com as imagens embutidas — era por isso que o crachá avulso saía com
 * as artes de outro evento, porque ninguém as pedia.
 */
export async function postGenerateBadges({
  eventId,
  sections,
  nameCase,
  blankCount = 0,
  withQrCode,
}: GerarCrachasParams): Promise<Blob> {
  try {
    const { data } = await apiClient.post<Blob>(
      `/events/${eventId}/crachas/pdf`,
      { sections: montarSecoes(sections, nameCase), blankCount, withQrCode },
      { responseType: 'blob' }
    );
    return data;
  } catch (erro) {
    // com `responseType: 'blob'` o erro do servidor também chega como blob
    const corpo = (erro as AxiosError)?.response?.data;
    let mensagem: string | undefined;

    if (corpo instanceof Blob) {
      try {
        const lido = JSON.parse(await corpo.text())?.message;
        mensagem = Array.isArray(lido) ? lido[0] : lido;
      } catch {
        // corpo que não é JSON: fica a mensagem genérica
      }
    }

    throw new Error(
      mensagem || 'Não foi possível gerar o PDF. Tente novamente.'
    );
  }
}
