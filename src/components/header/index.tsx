import { ArrowBack } from '@mui/icons-material';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  buttonBack?: boolean;
  pageBack?: string;
  description?: React.ReactNode;
  /**
   * Cabeçalho baixo, para página que tem abas e tabela embaixo (a do evento):
   * título em 18px, descrição em 13px colada nele, seta e ação centralizadas
   * na altura do bloco. Quem passa a ação passa ela também em tamanho `small`.
   */
  compacto?: boolean;
  /**
   * A ação fica ao lado do título também no celular, em vez de descer para
   * baixo dele. Para ação pequena que encolhe (o seletor de igreja): um botão
   * largo, na mesma linha, espremeria o título.
   */
  acaoAoLado?: boolean;
  children?: React.ReactNode;
}

function Header({
  title,
  buttonBack = false,
  pageBack,
  description,
  compacto = false,
  acaoAoLado = false,
  children,
}: HeaderProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  function GoPage() {
    if (pageBack) {
      navigate(pageBack);
    } else navigate(-1);
  }
  const style = {
    boxContainer: {
      mb: compacto ? 2.5 : 2,
    },
    boxInner: {
      display: 'flex',
      // pelo topo, e não pelo centro: com o botão de voltar ao lado de um
      // título de duas linhas, centralizar descia a seta para o meio do bloco
      // no compacto o bloco é baixo e a seta fica no meio dele
      alignItems: compacto ? 'center' : 'flex-start',
      // a ação quebra para a linha de baixo quando não cabe (celular)
      flexWrap: compacto ? 'wrap' : 'nowrap',
      rowGap: 1,
      gap: compacto ? 1 : 2,
      minWidth: 0,
      width: '100%',
    },
    boxColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      minWidth: 0,
      // ocupa o que sobra para a ação alcançar a borda direita; no compacto,
      // no celular, a linha toda (menos a seta), e a ação desce
      flex: compacto ? { xs: '1 1 calc(100% - 48px)', sm: 1 } : 1,
    },
    /**
     * Título à esquerda, ação à direita, **na mesma linha**.
     *
     * A ação divide a linha do título, e não a altura do bloco inteiro: antes
     * ela era alinhada contra título + descrição juntos, e num bloco de duas
     * linhas sobrava um degrau entre ela e o título — era isso que parecia
     * deslocado.
     *
     * `wrap` porque no celular não cabem os dois: a ação desce para a linha de
     * baixo em vez de espremer o título.
     */
    linhaDoTitulo: {
      display: 'flex',
      // No celular vira coluna: a ação desce inteira para baixo do título.
      // Confiar no `wrap` não bastava — a linha não quebrava e a ação saía pela
      // borda direita, cortada. Empilhar é determinístico.
      flexDirection: acaoAoLado ? 'row' : { xs: 'column', sm: 'row' },
      alignItems: acaoAoLado ? 'center' : { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      gap: { xs: 1, sm: 1.5 },
      minWidth: 0,
      width: '100%',
    },
    title: {
      lineHeight: compacto ? 1.25 : 1.2,
      fontSize: compacto ? 18 : { xs: 20, sm: 24 },
      color: theme.palette.text.primary,
      fontWeight: compacto ? 600 : 500,
      wordBreak: 'break-word',
    },
    description: {
      fontSize: compacto ? 13 : 16,
      lineHeight: compacto ? 1.4 : undefined,
      color: theme.palette.text.secondary,
    },
  };

  return (
    <Box sx={style.boxContainer}>
      <Box sx={style.boxInner}>
        {buttonBack && (
          <IconButton
            onClick={GoPage}
            size="small"
            sx={{ mt: compacto ? 0 : 0.25 }}
          >
            <ArrowBack
              sx={{
                color:
                  theme.palette.mode === 'dark'
                    ? theme.palette.text.primary
                    : theme.palette.primary.main,
              }}
            />
          </IconButton>
        )}
        {compacto ? (
          // título e descrição num bloco só, e a ação ao lado dele inteiro:
          // no celular ela desce para baixo do bloco, sem cair entre os dois
          <>
            <Box sx={style.boxColumn}>
              <Typography sx={style.title}>{title}</Typography>
              {description ? (
                <Typography component="div" sx={style.description}>
                  {description}
                </Typography>
              ) : null}
            </Box>
            {children}
          </>
        ) : (
          <Box sx={style.boxColumn}>
            {/* A descrição fica fora desta linha para correr embaixo das duas,
                alinhada com o título — e não indentada atrás da ação. */}
            <Box sx={style.linhaDoTitulo}>
              <Typography sx={style.title}>{title}</Typography>
              {children}
            </Box>

            {description ? (
              <Typography component="div" sx={style.description}>
                {description}
              </Typography>
            ) : null}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export { Header };
