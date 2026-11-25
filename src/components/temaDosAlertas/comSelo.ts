/**
 * Um rótulo curto logo abaixo do ícone, na cor dele ("Inscrito!"), para o
 * `title` do alerta. O texto é escapado: o `title` do SweetAlert é HTML.
 */
export const comSelo = (selo: string, titulo: string) => {
  const escapar = (texto: string) =>
    texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<span class="swal2-selo">${escapar(selo)}</span>${escapar(titulo)}`;
};
