import { alpha, Theme } from '@mui/material';

/**
 * Visual das tabelas do sistema.
 *
 * Fica num lugar só porque são cinco listas com o mesmo objeto visual — antes o
 * estilo estava copiado em cada uma, e o primeiro ajuste faria as cinco
 * divergirem.
 *
 * A ideia é a mesma dos cards de status: o cabeçalho não se separa por cor de
 * fundo, e sim pela tipografia (11px, caixa alta, espaçada) mais a linha de
 * baixo. O contorno da superfície é sombra, não borda — quem cuida disso é o
 * `MuiPaper` do tema.
 */
export const dataGridSx = (theme: Theme) => ({
  // a sombra e o raio são do Card que envolve; o grid vai de ponta a ponta
  border: 0,

  /**
   * Barra de ferramentas (colunas, filtro, densidade, exportar) com o mesmo
   * respiro das outras superfícies. Fica aqui, e não num toolbar próprio de cada
   * lista: como a regra desce da raiz do grid (`& .MuiDataGrid-toolbarContainer`),
   * ela ganha do estilo do próprio `GridToolbarContainer` por especificidade e
   * vale tanto para o `GridToolbar` padrão quanto para o toolbar customizado dos
   * inscritos.
   */
  '& .MuiDataGrid-toolbarContainer': {
    // sem respiro embaixo: quem separa a barra das linhas é o cabeçalho da
    // tabela, e 1.5 dos dois lados abria um vão grande demais ali
    p: 1.5,
    pb: 0,
  },

  '& .MuiDataGrid-columnHeaders': {
    // mesmo tom do resto da tabela: quem separa o cabeçalho é a linha de baixo
    // e a tipografia
    backgroundColor: 'transparent',
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: theme.palette.text.secondary,
  },
  // separador de coluna sai: só suja, já que o cabeçalho não tem fundo próprio
  '& .MuiDataGrid-columnSeparator': {
    display: 'none',
  },

  // separador entre linhas mais leve que o divider cheio, que pesava a tabela
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
  },
  '& .MuiDataGrid-row:last-of-type .MuiDataGrid-cell': {
    borderBottom: 'none',
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: theme.palette.background.hover,
  },

  '& .MuiDataGrid-footerContainer': {
    backgroundColor: 'transparent',
    border: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    minHeight: '44px !important',
  },

  /**
   * Classes para aplicar por coluna, via `cellClassName` na definição:
   * `numerica` em CPF, datas e valores, para os dígitos não dançarem de largura
   * entre as linhas; `destaque` na coluna que identifica o registro.
   */
  '& .celula-numerica': {
    fontVariantNumeric: 'tabular-nums',
  },
  '& .celula-destaque': {
    fontWeight: 500,
  },

  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
    {
      outline: 'none',
    },
});

/**
 * Casca do Card que envolve a tabela. O raio de 12px é o das superfícies de
 * página; o `overflow` é o que faz a linha do cabeçalho respeitar o canto.
 */
export const cardTabelaSx = {
  borderRadius: 3,
  overflow: 'hidden',
};

/**
 * Superfície de página: o Paper que segura busca, filtros e botões acima da
 * tabela. Só o raio — a sombra e a ausência de borda vêm do `MuiPaper` do tema.
 */
export const superficieSx = {
  borderRadius: 3,
};

/**
 * Barra de busca e filtros das listagens, no celular: cada item da barra e
 * cada campo, select ou grupo de botões de filtro ocupa a linha inteira.
 *
 * Sem isto, o campo pedia `width: 100%` de uma caixa que, numa barra em linha
 * com quebra, encolhia até o tamanho do conteúdo — e no celular a busca, o
 * select de status e o botão de criar ficavam estreitos, cada um de um
 * tamanho. Os filhos são forçados (`&&`, especificidade dobrada) porque cada
 * tela dá larguras próprias para a tela grande.
 *
 * Só abaixo do `sm`: da tela média para cima a barra segue como cada tela
 * desenhou.
 */
export const barraLarguraCheiaNoCelularSx = {
  '@media (max-width: 599.95px)': {
    '&& > *, && .MuiFormControl-root, && .MuiToggleButtonGroup-root, && .MuiAutocomplete-root':
      { width: '100%' },
    '&& .MuiToggleButtonGroup-root > .MuiToggleButton-root': { flex: 1 },
  },
};
