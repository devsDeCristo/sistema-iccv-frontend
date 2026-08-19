import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

/** Nome de arquivo seguro a partir do nome do evento */
export function buildFileName(eventName: string, extension: string) {
  const slug = (eventName || 'evento')
    // NFD separa o acento da letra; o filtro seguinte descarta só o acento
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${slug || 'evento'}-inscritos.${extension}`;
}

export function exportXlsx(data: string[][], fileName: string) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // largura das colunas pelo maior conteúdo, senão tudo sai espremido
  worksheet['!cols'] = (data[0] ?? []).map((_, columnIndex) => {
    const widest = data.reduce(
      (max, row) => Math.max(max, String(row[columnIndex] ?? '').length),
      10
    );
    return { wch: Math.min(widest + 2, 45) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscritos');
  XLSX.writeFile(workbook, fileName);
}

export function exportCsv(data: string[][], fileName: string) {
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });

  // BOM (﻿): sem ele o Excel abre os acentos errados
  const blob = new Blob(['﻿' + csv], {
    type: 'text/csv;charset=utf-8',
  });

  FileSaver.saveAs(blob, fileName);
}
