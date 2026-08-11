import { useEffect, useState } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Quantidade de itens por página para cada quantidade de colunas do grid.
 * Os valores são múltiplos do nº de colunas para que as linhas sempre fiquem
 * completas e não sobre "slot vazio" no fim da lista (o que dá a impressão
 * de que a listagem acabou e o usuário ignora a paginação).
 */
const ITEMS_PER_PAGE_BY_COLUMNS: Record<number, number> = {
  1: 6, // xs
  2: 8, // md
  3: 12, // xl
};

/**
 * Paginação para listagens em grid de cards com breakpoints xs=12 / md=6 / xl=4.
 */
function useGridPagination<T>(data: T[]) {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const columns = isXl ? 3 : isMd ? 2 : 1;
  const itemsPerPage = ITEMS_PER_PAGE_BY_COLUMNS[columns];

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // ao trocar de breakpoint o tamanho da página muda, então volta para o início
  useEffect(() => {
    setPage(1);
  }, [itemsPerPage]);

  // ao filtrar/remover itens a página atual pode deixar de existir
  useEffect(() => {
    setPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  return {
    page: currentPage,
    setPage,
    totalPages,
    itemsPerPage,
    columns,
    paginatedData: data.slice(startIndex, startIndex + itemsPerPage),
    total: data.length,
    rangeStart: data.length === 0 ? 0 : startIndex + 1,
    rangeEnd: Math.min(startIndex + itemsPerPage, data.length),
  };
}

export { useGridPagination };
