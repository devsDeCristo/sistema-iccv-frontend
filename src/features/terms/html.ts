import DOMPurify from 'dompurify';

/**
 * O que o editor dos termos produz e a página aceita mostrar.
 *
 * O texto vem do banco e vai para uma página pública: mesmo escrito por super
 * admin, passa por aqui. Fora da lista não entra — nem script, nem estilo, nem
 * cor. O visual é o da página, e não o que alguém colou de outro documento.
 */
const TAGS = [
  'h2',
  'h3',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'a',
];

export interface SecaoDosTermos {
  id: string;
  titulo: string;
}

/**
 * Limpa o HTML e devolve junto as seções (os títulos `h2`), que viram o
 * índice lateral. A numeração não vem do texto: é a página que numera.
 */
export function prepararTermos(html: string): {
  html: string;
  secoes: SecaoDosTermos[];
} {
  const limpo = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TAGS,
    ALLOWED_ATTR: ['href'],
  });
  const doc = new DOMParser().parseFromString(limpo, 'text/html');

  const secoes = Array.from(doc.querySelectorAll('h2')).map((h2, indice) => {
    const id = `secao-${indice + 1}`;
    h2.id = id;
    return { id, titulo: h2.textContent?.trim() ?? '' };
  });

  // link para fora abre em outra aba, sem dar à página de lá acesso a esta
  doc.querySelectorAll('a[href]').forEach((link) => {
    if (link.getAttribute('href')?.startsWith('mailto:')) return;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return { html: doc.body.innerHTML, secoes };
}
