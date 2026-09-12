import { ArrowBack } from '@mui/icons-material';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  buttonBack?: boolean;
  pageBack?: string;
  description?: string;
  children?: React.ReactNode;
}

function Header({
  title,
  buttonBack = false,
  pageBack,
  description,
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
      mb: 2,
    },
    boxInner: {
      gap: 2,
      display: 'flex',
      // pelo topo, e não pelo centro: com o botão de voltar ao lado de um
      // título de duas linhas, centralizar descia a seta para o meio do bloco
      alignItems: 'flex-start',
      minWidth: 0,
      width: '100%',
    },
    boxColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      minWidth: 0,
      // ocupa o que sobra para a ação alcançar a borda direita
      flex: 1,
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
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      gap: { xs: 1, sm: 1.5 },
      minWidth: 0,
      width: '100%',
    },
    title: {
      lineHeight: 1.2,
      fontSize: { xs: 20, sm: 24 },
      color: theme.palette.text.primary,
      fontWeight: 500,
      wordBreak: 'break-word',
    },
    description: {
      fontSize: 16,
      color: theme.palette.text.secondary,
    },
  };

  return (
    <Box sx={style.boxContainer}>
      <Box sx={style.boxInner}>
        {buttonBack && (
          <IconButton onClick={GoPage} size="small" sx={{ mt: 0.25 }}>
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
        <Box sx={style.boxColumn}>
          {/* A descrição fica fora desta linha para correr embaixo das duas,
              alinhada com o título — e não indentada atrás da ação. */}
          <Box sx={style.linhaDoTitulo}>
            <Typography sx={style.title}>{title}</Typography>
            {children}
          </Box>

          {description ? (
            <Typography sx={style.description}>{description}</Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export { Header };
