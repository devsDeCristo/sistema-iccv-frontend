/**
 * O termo do evento é HTML do editor, e "vazio" no editor não é string vazia:
 * uma caixa em que se digitou e se apagou volta como `<p><br></p>`. Sem tratar
 * isso, todo evento que passou pela etapa de termos passaria a exigir aceite —
 * inclusive os que não têm termo nenhum.
 */
function termoEstaVazio(html?: string | null) {
  if (!html) return true;

  // termo escrito como imagem continua sendo termo, mesmo sem texto
  if (/<(img|iframe|video)\b/i.test(html)) return false;

  const texto = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return texto.length === 0;
}

/** O termo como ele vai para o backend: string vazia quer dizer "sem termo". */
export function textoDoTermo(html?: string | null) {
  return termoEstaVazio(html) ? '' : (html as string);
}

/** Se este evento exige aceite para inscrever. */
export function temTermo(html?: string | null) {
  return !termoEstaVazio(html);
}
