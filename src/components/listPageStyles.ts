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
 * Campo de busca das telas de listagem.
 *
 * O campo se destaca do Paper por tom (`background.input`), não por sombra, e o
 * foco pinta a borda na cor primária sem engrossá-la — engrossar empurra o texto
 * um pixel e o campo "pula" ao focar.
 */
export const campoBuscaSx = (theme: Theme) => {
  const raizDoCampo = {
    borderRadius: 2,
    backgroundColor: theme.palette.background.input,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.border,
    },
    '&.Mui-focused fieldset': {
      borderWidth: 1,
      borderColor: theme.palette.primary.main,
    },
  };

  return {
    /**
     * Os dois seletores são necessários porque o `sx` aterrissa em elementos
     * diferentes conforme o componente:
     *
     * - `TextField`: a classe vai para o FormControl, e a raiz do input é
     *   descendente → casa com `& .MuiOutlinedInput-root`
     * - `Select`: a classe vai para a própria raiz do input → casa com
     *   `&.MuiOutlinedInput-root`, sem o espaço
     *
     * Com só o de descendente, os selects de Grupo e Situação ficavam sem
     * estilo. Não dá para conferir isso procurando a regra no CSS gerado — ela
     * é emitida de qualquer jeito; o que decide é em qual elemento a classe cai.
     */
    '& .MuiOutlinedInput-root': raizDoCampo,
    '&.MuiOutlinedInput-root': raizDoCampo,
  };
};
